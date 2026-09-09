import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/status-badge'

describe('StatusBadge Component', () => {
  describe('Order Status', () => {
    it('should render pending status', () => {
      render(<StatusBadge type="order" status="pending" />)
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    it('should render confirmed status', () => {
      render(<StatusBadge type="order" status="confirmed" />)
      expect(screen.getByText('Confirmed')).toBeInTheDocument()
    })

    it('should render preparing status', () => {
      render(<StatusBadge type="order" status="preparing" />)
      expect(screen.getByText('Preparing')).toBeInTheDocument()
    })

    it('should render ready status', () => {
      render(<StatusBadge type="order" status="ready" />)
      expect(screen.getByText('Ready')).toBeInTheDocument()
    })

    it('should render served status', () => {
      render(<StatusBadge type="order" status="served" />)
      expect(screen.getByText('Served')).toBeInTheDocument()
    })

    it('should render completed status', () => {
      render(<StatusBadge type="order" status="completed" />)
      expect(screen.getByText('Completed')).toBeInTheDocument()
    })

    it('should render cancelled status', () => {
      render(<StatusBadge type="order" status="cancelled" />)
      expect(screen.getByText('Cancelled')).toBeInTheDocument()
    })
  })

  describe('Table Status', () => {
    it('should render available status', () => {
      render(<StatusBadge type="table" status="available" />)
      expect(screen.getByText('Available')).toBeInTheDocument()
    })

    it('should render occupied status', () => {
      render(<StatusBadge type="table" status="occupied" />)
      expect(screen.getByText('Occupied')).toBeInTheDocument()
    })

    it('should render reserved status', () => {
      render(<StatusBadge type="table" status="reserved" />)
      expect(screen.getByText('Reserved')).toBeInTheDocument()
    })

    it('should render unavailable status', () => {
      render(<StatusBadge type="table" status="unavailable" />)
      expect(screen.getByText('Unavailable')).toBeInTheDocument()
    })
  })

  describe('Payment Status', () => {
    it('should render unpaid status', () => {
      render(<StatusBadge type="payment" status="unpaid" />)
      expect(screen.getByText('Unpaid')).toBeInTheDocument()
    })

    it('should render pending status', () => {
      render(<StatusBadge type="payment" status="pending" />)
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    it('should render paid status', () => {
      render(<StatusBadge type="payment" status="paid" />)
      expect(screen.getByText('Paid')).toBeInTheDocument()
    })

    it('should render refunded status', () => {
      render(<StatusBadge type="payment" status="refunded" />)
      expect(screen.getByText('Refunded')).toBeInTheDocument()
    })
  })
})
