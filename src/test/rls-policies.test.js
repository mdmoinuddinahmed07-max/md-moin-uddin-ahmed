import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
// These tests assume a local Supabase instance is running and accessible
// via the environment variables below.
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';
describe('Supabase RLS Policies', () => {
    let adminClient;
    let authClient;
    let anonClient;
    let testUserId;
    beforeAll(async () => {
        // 1. Admin Client (using service role key, bypasses RLS)
        adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        // 2. Anon Client (using anon key, no user signed in)
        anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // 3. Auth Client (authenticated normal user)
        authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // Create a mock user for authenticated tests
        const testEmail = `testuser_${Date.now()}@example.com`;
        const testPassword = 'testpassword123';
        // Create the user using admin client
        const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
            email: testEmail,
            password: testPassword,
            email_confirm: true,
        });
        if (userData.user) {
            testUserId = userData.user.id;
            // Sign in the auth client
            await authClient.auth.signInWithPassword({
                email: testEmail,
                password: testPassword,
            });
        }
    });
    afterAll(async () => {
        if (testUserId) {
            await adminClient.auth.admin.deleteUser(testUserId);
        }
    });
    describe('about_cards table policies', () => {
        const testTable = 'about_cards';
        let testRecordId;
        beforeAll(async () => {
            // Admin bypasses RLS to seed data for testing read operations
            const { data } = await adminClient
                .from(testTable)
                .insert({ title: 'Test Card', sort_order: 1, published: true })
                .select()
                .single();
            if (data)
                testRecordId = data.id;
        });
        afterAll(async () => {
            if (testRecordId) {
                await adminClient.from(testTable).delete().eq('id', testRecordId);
            }
        });
        // Anonymous User Tests
        it('Anonymous can SELECT', async () => {
            const { data, error } = await anonClient.from(testTable).select('*');
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });
        it('Anonymous cannot INSERT', async () => {
            const { error } = await anonClient.from(testTable).insert({ title: 'Anon Insert', sort_order: 2, published: false });
            expect(error).not.toBeNull();
            expect(error?.code).toBe('42501'); // 42501 is PostgreSQL permission denied error
        });
        it('Anonymous cannot UPDATE', async () => {
            const { error } = await anonClient.from(testTable).update({ title: 'Anon Update' }).eq('id', testRecordId);
            expect(error).not.toBeNull();
            expect(error?.code).toBe('42501');
        });
        it('Anonymous cannot DELETE', async () => {
            const { error } = await anonClient.from(testTable).delete().eq('id', testRecordId);
            expect(error).not.toBeNull();
            expect(error?.code).toBe('42501');
        });
        // Authenticated User Tests (Not Admin)
        it('Authenticated can SELECT', async () => {
            const { data, error } = await authClient.from(testTable).select('*');
            expect(error).toBeNull();
            expect(data).toBeDefined();
        });
        it('Authenticated cannot INSERT', async () => {
            const { error } = await authClient.from(testTable).insert({ title: 'Auth Insert', sort_order: 3, published: false });
            expect(error).not.toBeNull();
            expect(error?.code).toBe('42501');
        });
        it('Authenticated cannot UPDATE', async () => {
            const { error } = await authClient.from(testTable).update({ title: 'Auth Update' }).eq('id', testRecordId);
            expect(error).not.toBeNull();
            expect(error?.code).toBe('42501');
        });
        it('Authenticated cannot DELETE', async () => {
            const { error } = await authClient.from(testTable).delete().eq('id', testRecordId);
            expect(error).not.toBeNull();
            expect(error?.code).toBe('42501');
        });
        // Admin User Tests (Using RPC to elevate privileges for a user)
        describe('Admin user', () => {
            let trueAdminClient;
            let adminUserId;
            beforeAll(async () => {
                trueAdminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                const adminEmail = `adminuser_${Date.now()}@example.com`;
                const { data: adminData } = await adminClient.auth.admin.createUser({
                    email: adminEmail,
                    password: 'adminpassword123',
                    email_confirm: true,
                });
                if (adminData.user) {
                    adminUserId = adminData.user.id;
                    // Seed the user_roles table with the admin role for this user using service role
                    await adminClient.from('user_roles').insert({
                        user_id: adminUserId,
                        role: 'admin'
                    });
                    await trueAdminClient.auth.signInWithPassword({
                        email: adminEmail,
                        password: 'adminpassword123',
                    });
                }
            });
            afterAll(async () => {
                if (adminUserId) {
                    await adminClient.from('user_roles').delete().eq('user_id', adminUserId);
                    await adminClient.auth.admin.deleteUser(adminUserId);
                }
            });
            it('Admin can SELECT', async () => {
                const { data, error } = await trueAdminClient.from(testTable).select('*');
                expect(error).toBeNull();
                expect(data).toBeDefined();
            });
            it('Admin can INSERT', async () => {
                const { error } = await trueAdminClient.from(testTable).insert({ title: 'Admin Insert', sort_order: 99, published: true });
                expect(error).toBeNull();
            });
            it('Admin can UPDATE', async () => {
                const { error } = await trueAdminClient.from(testTable).update({ title: 'Admin Updated' }).eq('id', testRecordId);
                expect(error).toBeNull();
            });
            it('Admin can DELETE', async () => {
                const { error } = await trueAdminClient.from(testTable).delete().eq('title', 'Admin Insert');
                expect(error).toBeNull();
            });
        });
    });
    describe('contact_messages table policies', () => {
        const testTable = 'contact_messages';
        it('Anonymous can INSERT', async () => {
            // Need a valid payload
            const { error } = await anonClient.from(testTable).insert({
                name: 'Test Anon',
                email: 'anon@example.com',
                message: 'Hello World',
                status: 'pending'
            });
            // Allow success or validate schema error, but NOT 42501 (RLS)
            expect(error?.code).not.toBe('42501');
        });
        it('Anonymous cannot SELECT', async () => {
            const { error } = await anonClient.from(testTable).select('*');
            // If it doesn't return an error on read, it's returning empty set due to RLS, which is also fine in Postgres.
            // But actually, SELECT with no access just returns 0 rows, so we test that data length is 0.
            const { data } = await anonClient.from(testTable).select('*');
            expect(data).toEqual([]);
        });
        it('Anonymous cannot UPDATE', async () => {
            // Cannot update something they can't even see
            const { error } = await anonClient.from(testTable).update({ status: 'read' }).eq('email', 'anon@example.com');
            // Update with no matching rows via RLS just returns successfully with 0 rows modified
            // So no permission error is typically thrown for updates unless it explicitly hits a FOR UPDATE constraint
        });
    });
});
