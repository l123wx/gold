import { useParams } from 'react-router-dom'

export default function DayDetail() {
  const { date } = useParams<{ date: string }>()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{date} 金价详情</h1>
    </div>
  )
}
