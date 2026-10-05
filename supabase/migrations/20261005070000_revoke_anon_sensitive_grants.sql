-- Remove direct anonymous CRUD grants from tables classified as sensitive by
-- security.assert_rls_integrity(). RLS is not a substitute for least privilege.
do $$
declare
  v_table text;
  v_sensitive text[] := array[
    'user_secrets',
    'quantum_firewall_logs',
    'quantum_transfer_history',
    'dao_votes',
    'notifications',
    'password_reset_tokens',
    'user_roles',
    'profiles',
    'price_alerts',
    'watchlist',
    'portfolio_holdings',
    'portfolio_snapshots',
    'mining_history',
    'security_audit_log',
    'security_memory_snapshots',
    'dao_eligible_voters',
    'defense_audit_events'
  ];
begin
  foreach v_table in array v_sensitive loop
    if to_regclass(format('public.%I', v_table)) is not null then
      execute format(
        'revoke select, insert, update, delete on table public.%I from anon',
        v_table
      );
    end if;
  end loop;
end $$;
