import { render, screen } from '@testing-library/react'
import { Brand } from '@/components/brand'
import { RESTAURANT_NAME, RESTAURANT_TAGLINE } from '@/lib/constants'

describe('Brand Component', () => {
  it('should render restaurant name', () => {
    render(<Brand />)
    expect(screen.getByText(RESTAURANT_NAME)).toBeInTheDocument()
  })

  it('should render tagline by default', () => {
    render(<Brand />)
    expect(screen.getByText(RESTAURANT_TAGLINE)).toBeInTheDocument()
  })

  it('should hide tagline when showTagline is false', () => {
    render(<Brand showTagline={false} />)
    expect(screen.queryByText(RESTAURANT_TAGLINE)).not.toBeInTheDocument()
  })

  it('should render link when href is provided', () => {
    render(<Brand href="/admin" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/admin')
  })

  it('should apply custom className', () => {
    const { container } = render(<Brand className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
