import { POST as checkoutPost } from '@/app/api/stripe/checkout/route'

export async function POST(req: Request) {
  return checkoutPost(req)
}

export async function GET(req: Request) {
  return checkoutPost(req)
}
