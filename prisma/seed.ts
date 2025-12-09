import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create agent user
  const agentEmail = 'agent@example.com';
  const agentPassword = 'agent123';
  const agentHashed = await bcrypt.hash(agentPassword, 10);

  const agent = await prisma.user.upsert({
    where: { email: agentEmail },
    update: { name: 'Support Agent', password: agentHashed, role: 'AGENT' },
    create: { email: agentEmail, name: 'Support Agent', password: agentHashed, role: 'AGENT' },
  });

  console.log('✓ Agent user ensured:', agent.email);

  // Create external client user
  const clientEmail = 'client@example.com';
  const clientPassword = 'client123';
  const clientHashed = await bcrypt.hash(clientPassword, 10);

  const client = await prisma.user.upsert({
    where: { email: clientEmail },
    update: { name: 'External Client', password: clientHashed, role: 'CLIENT', clientType: 'EXTERNAL' },
    create: { email: clientEmail, name: 'External Client', password: clientHashed, role: 'CLIENT', clientType: 'EXTERNAL' },
  });

  console.log('✓ External client user ensured:', client.email);

  // Create internal client user
  const client2Email = 'maria@example.com';
  const client2Password = 'maria123';
  const client2Hashed = await bcrypt.hash(client2Password, 10);

  const client2 = await prisma.user.upsert({
    where: { email: client2Email },
    update: { name: 'María García', password: client2Hashed, role: 'CLIENT', clientType: 'INTERNAL' },
    create: { email: client2Email, name: 'María García', password: client2Hashed, role: 'CLIENT', clientType: 'INTERNAL' },
  });

  console.log('✓ Internal client user ensured:', client2.email);

  // Create example tickets
  const tickets = [
    {
      ticketNumber: 'TKT-000001',
      title: 'VPN connection keeps dropping randomly',
      description: 'The VPN connection to the corporate network disconnects every 15-20 minutes without any error message. This is affecting my ability to access internal resources and complete my work. I have tried reinstalling the VPN client but the issue persists.',
      status: 'open',
      priority: 'high',
      category: 'TECHNICAL',
      createdById: client2.id,
    },
    {
      ticketNumber: 'TKT-000002',
      title: 'Unable to access shared drive on network',
      description: 'Since this morning I cannot access the shared network drive (\\\\fileserver\\projects). I get an "Access Denied" error even though I had access yesterday. Other team members can access it without issues. This is blocking my current project work.',
      status: 'in_progress',
      priority: 'high',
      category: 'TECHNICAL',
      createdById: client.id,
      assignedToId: agent.id,
    },
    {
      ticketNumber: 'TKT-000003',
      title: 'Email synchronization issues with Outlook',
      description: 'My Outlook is not synchronizing properly with the Exchange server. Emails sent 2 hours ago are still showing in the Outbox, and I am not receiving new emails in real-time. The status bar shows "Disconnected" intermittently.',
      status: 'in_progress',
      priority: 'high',
      category: 'TECHNICAL',
      createdById: client.id,
      assignedToId: agent.id,
    },
    {
      ticketNumber: 'TKT-000004',
      title: 'Request for software license renewal',
      description: 'Our Adobe Creative Cloud license expires in 5 days. Please renew the license for our design team (10 users). The account administrator email is admin@company.com. Let me know if you need any additional information for processing this renewal.',
      status: 'open',
      priority: 'high',
      category: 'GENERAL',
      createdById: client2.id,
    },
  ];

  for (const ticketData of tickets) {
    await prisma.ticket.upsert({
      where: { ticketNumber: ticketData.ticketNumber },
      update: ticketData,
      create: ticketData,
    });
  }

  console.log('✓ Example tickets created:', tickets.length);

  // Create some example comments
  const ticket1 = await prisma.ticket.findUnique({ where: { ticketNumber: 'TKT-000001' } });
  const ticket2 = await prisma.ticket.findUnique({ where: { ticketNumber: 'TKT-000002' } });
  const ticket3 = await prisma.ticket.findUnique({ where: { ticketNumber: 'TKT-000003' } });

  if (ticket1) {
    await prisma.comment.create({
      data: {
        message: 'Hello, we are reviewing your case. Could you confirm the email address associated with your account?',
        ticketId: ticket1.id,
        userId: agent.id,
        isInternal: false,
      },
    });
  }

  if (ticket2) {
    await prisma.comment.create({
      data: {
        message: 'I have contacted the payments team to review this error.',
        ticketId: ticket2.id,
        userId: agent.id,
        isInternal: true,
      },
    });
    await prisma.comment.create({
      data: {
        message: 'We have identified the problem. We are working on the solution.',
        ticketId: ticket2.id,
        userId: agent.id,
        isInternal: false,
      },
    });
  }

  if (ticket3) {
    await prisma.comment.create({
      data: {
        message: 'Yes, you can export reports in PDF from the configuration menu.',
        ticketId: ticket3.id,
        userId: agent.id,
        isInternal: false,
      },
    });
    await prisma.comment.create({
      data: {
        message: 'Perfect! Thank you very much for your help.',
        ticketId: ticket3.id,
        userId: client2.id,
        isInternal: false,
      },
    });
  }

  console.log('✓ Example comments created');
}

main()
  .then(() => {
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
