export const TIP_FEE_PERCENTAGE = 0.15

export function calculatePricing(serviceAmount) {
  const tipFee = serviceAmount * TIP_FEE_PERCENTAGE
  const providerReceives = serviceAmount - tipFee
  return { serviceAmount, tipFee, providerReceives, total: serviceAmount }
}

export function calculateCancellationRefund(totalPaid, serviceAmount, isLate) {
  if (!isLate) {
    return { refund: totalPaid, retained: 0, reason: 'Cancelamento antecipado - reembolso total' }
  }
  const retained = serviceAmount * 0.20
  const refund = totalPaid - retained
  return { refund, retained, reason: 'Cancelamento tardio - 20% retido como compensação' }
}

export function isLateCancel(scheduledDate, scheduledPeriod) {
  const now = new Date()
  const serviceDateTime = new Date(scheduledDate)
  const periodHours = { 'Manhã': 9, 'Tarde': 14, 'Noite': 19 }
  serviceDateTime.setHours(periodHours[scheduledPeriod] || 9, 0, 0, 0)
  const diffMs = serviceDateTime - now
  const diffHours = diffMs / (1000 * 60 * 60)
  return diffHours < 12 && diffHours > 0
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
