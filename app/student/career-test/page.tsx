"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CareerTestRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/student/tasks") }, [router])
  return null
}
