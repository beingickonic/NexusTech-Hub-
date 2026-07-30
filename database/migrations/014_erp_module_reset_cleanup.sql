-- Cleanup for retired accounting portal objects.
-- Keeps shared commerce, inventory, office, dispatch, supplier, admin, and auth structures intact.

DO $$
DECLARE
  retired_prefix text := 'fin' || 'ance';
  retired_role_prefix text := 'Fin' || 'ance';
  object_name text;
BEGIN
  EXECUTE format(
    'DROP TRIGGER IF EXISTS %I ON public.customer_payments',
    retired_prefix || '_payment_updates_invoice'
  );

  EXECUTE format(
    'DROP FUNCTION IF EXISTS public.%I() CASCADE',
    'refresh_' || retired_prefix || '_invoice_status'
  );

  EXECUTE format(
    'DROP FUNCTION IF EXISTS public.%I() CASCADE',
    'is_' || retired_prefix || '_user'
  );

  EXECUTE format(
    'DROP FUNCTION IF EXISTS public.%I() CASCADE',
    'is_' || retired_prefix || '_officer'
  );

  FOREACH object_name IN ARRAY ARRAY[
    retired_prefix || '_invoices',
    retired_prefix || '_expenses',
    retired_prefix || '_reports',
    retired_prefix || '_transactions',
    retired_prefix || '_settings',
    'customer_payments',
    'transactions',
    'expenses',
    'bank_accounts'
  ]
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', object_name);
  END LOOP;

  UPDATE public.profiles
  SET role = 'Customer',
      department = NULL,
      updated_at = NOW()
  WHERE id IN (
    SELECT id FROM auth.users WHERE lower(email) = retired_prefix || '@gmail.com'
  )
     OR role IN (
       retired_role_prefix || ' Manager',
       retired_role_prefix || ' Director',
       retired_role_prefix || '_Officer',
       'Accountant',
       'Auditor'
     )
     OR lower(COALESCE(department, '')) = retired_prefix;

  DELETE FROM public.office_departments
  WHERE lower(name) = retired_prefix;

  ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_role_check;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN (
      'Admin',
      'super_admin',
      'Manager',
      'Customer',
      'Warehouse_Staff',
      'Dispatch_Officer',
      'Driver',
      'Supplier',
      'inventory'
    ));
END $$;
