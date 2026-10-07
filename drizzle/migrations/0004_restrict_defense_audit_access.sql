REVOKE ALL ON TABLE public.defense_audit_events FROM PUBLIC, anon;
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.defense_audit_events FROM authenticated;
GRANT SELECT, INSERT ON TABLE public.defense_audit_events TO authenticated;
GRANT ALL ON TABLE public.defense_audit_events TO service_role;