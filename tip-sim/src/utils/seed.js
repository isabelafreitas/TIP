// Seeds demo data for isa@tip.com when they log in
export function seedDemoData(userId) {
  // Seed services
  const svcKey = 'tip_services'
  let services = []
  try { services = JSON.parse(localStorage.getItem(svcKey)) || [] } catch {}
  const hasDemoSvc = services.some(s => s.id === 'demo-svc-1')
  if (!hasDemoSvc) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 2)
    services = [
      {
        id: 'demo-svc-1',
        requesterId: userId,
        providerId: 'p1',
        providerName: 'Maria Rodrigues',
        providerInitials: 'MR',
        description: 'Preciso trocar algumas tomadas e instalar um novo disjuntor no quadro elétrico.',
        date: tomorrow.toISOString().split('T')[0],
        period: 'Manhã',
        amount: 150,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        chatSessionId: 'demo-chat-1',
      },
      ...services,
    ]
    localStorage.setItem(svcKey, JSON.stringify(services))
  }

  // Seed announcements
  const annKey = 'tip_announcements'
  let announcements = []
  try { announcements = JSON.parse(localStorage.getItem(annKey)) || [] } catch {}
  const hasDemoAnn = announcements.some(a => a.id === 'demo-ann-1')
  if (!hasDemoAnn) {
    announcements = [
      {
        id: 'demo-ann-1',
        userId,
        title: 'Preciso de encanador urgente',
        description: 'Torneira do banheiro pingando, preciso de alguém disponível esta semana.',
        tags: ['Encanador'],
        price: 100,
        deadline: 'Esta semana',
        status: 'active',
        candidates: [
          { id: 'p8', name: 'Gabriela Lima', initials: 'GL', rating: 4.8 },
          { id: 'p3', name: 'Carlos Pires', initials: 'CP', rating: 4.7 },
        ],
        createdAt: new Date().toISOString(),
      },
      ...announcements,
    ]
    localStorage.setItem(annKey, JSON.stringify(announcements))
  }

  // Seed chats
  const chatKey = 'tip_chats'
  let chats = []
  try { chats = JSON.parse(localStorage.getItem(chatKey)) || [] } catch {}
  const hasDemoChat = chats.some(c => c.id === 'demo-chat-1')
  if (!hasDemoChat) {
    const now = new Date()
    const m = (text, senderId, minsAgo) => ({
      id: 'dmsg_' + minsAgo,
      text,
      senderId,
      sentAt: new Date(now - minsAgo * 60000).toISOString(),
    })
    chats = [
      {
        id: 'demo-chat-1',
        userId,
        providerId: 'p1',
        providerName: 'Maria Rodrigues',
        providerInitials: 'MR',
        messages: [
          m('Olá Maria! Preciso de ajuda com o quadro elétrico.', userId, 60),
          m('Olá! Claro, posso ir amanhã de manhã. Pode me passar o endereço?', 'p1', 50),
          m('Ótimo! Sou na Rua Augusta, 1234, Pinheiros.', userId, 45),
          m('Perfeito! Estarei lá às 9h. Até amanhã!', 'p1', 44),
        ],
        lastMessage: 'Perfeito! Estarei lá às 9h. Até amanhã!',
        lastAt: new Date(now - 44 * 60000).toISOString(),
        createdAt: new Date(now - 61 * 60000).toISOString(),
      },
      ...chats,
    ]
    localStorage.setItem(chatKey, JSON.stringify(chats))
  }
}
