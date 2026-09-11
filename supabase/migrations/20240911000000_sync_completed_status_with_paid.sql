-- Migration: Sync order status "completed" with payment_status "paid"
-- This ensures that when an order is marked as completed, payment is automatically marked as paid

-- Step 1: Update all existing orders that have status="completed" but payment_status != "paid"
UPDATE public.orders
SET payment_status = 'paid'
WHERE status = 'completed' 
  AND payment_status != 'paid';

-- Step 2: Create a trigger function to automatically update payment_status when status changes to "completed"
CREATE OR REPLACE FUNCTION sync_completed_order_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- When order status is set to "completed", automatically mark payment as "paid"
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.payment_status := 'paid';
    
    -- Also ensure completed_at is set
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at := NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Drop the trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS trigger_sync_completed_order_payment ON public.orders;

-- Step 4: Create the trigger
CREATE TRIGGER trigger_sync_completed_order_payment
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed')
  EXECUTE FUNCTION sync_completed_order_payment();

-- Step 5: Add comment for documentation
COMMENT ON FUNCTION sync_completed_order_payment() IS 
  'Automatically sets payment_status to paid and completed_at timestamp when order status changes to completed';
