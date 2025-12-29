import { redirect } from 'next/navigation'

// Root page redirects to startup by default
// In production, you might want to show a landing page instead
export default function HomePage() {
  redirect('/startup')
}
