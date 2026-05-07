import { NextRequest, NextResponse } from 'next/server'
import { parseTomTomIncidents } from '@/lib/api/tomtom'

export async function GET(req: NextRequest) {
  const bbox = req.nextUrl.searchParams.get('bbox')
  if (!bbox) return NextResponse.json([])

  const apiKey = process.env.TOMTOM_API_KEY
  if (!apiKey || apiKey === 'your_tomtom_api_key_here') {
    return NextResponse.json([])
  }

  const fields = '{incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity,probabilityOfOccurrence,numberOfReports,lastReportTime,tmc{countryCode,tableNumber,tableVersion,direction,points{sequence,location}}}}}'

  const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${apiKey}&bbox=${bbox}&fields=${encodeURIComponent(fields)}&language=en-GB&categoryFilter=0,1,2,3,4,5,6,7,8,9,10,11,14&timeValidityFilter=present`

  try {
    const res = await fetch(url, { next: { revalidate: 60 } })
    if (!res.ok) return NextResponse.json([])
    const data = await res.json()
    return NextResponse.json(parseTomTomIncidents(data))
  } catch {
    return NextResponse.json([])
  }
}
