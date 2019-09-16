With signatures as (
    Select --n.nspname || '.' || 
        p.proname as nm, --name
        pg_catalog.pg_get_function_arguments(p.oid) as "args",
        pg_catalog.pg_get_function_result(p.oid) as "ret", --returns
        d.description as nt --note
    From pg_catalog.pg_proc p
        Left Join pg_catalog.pg_namespace n ON n.oid = p.pronamespace
        Left Join pg_catalog.pg_description d On p.oid = d.objoid
    Where pg_catalog.pg_function_is_visible(p.oid)
        And p.prorettype <> 'pg_catalog.trigger'::pg_catalog.regtype 
        --AND n.nspname <> 'pg_catalog'
        --AND n.nspname <> 'information_schema'
    Order By 1
) Select array_to_json( array_agg( s.* ) ) From signatures s;
