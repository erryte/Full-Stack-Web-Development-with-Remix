import type { Invoice, Prisma } from '@prisma/client';
import zod from 'zod';
import { deleteAttachment } from '~/attachments.server';
import { db } from '~/db.server';

type InvoiceCreateData = Pick<Invoice, 'title' | 'description' | 'amount' | 'attachment' | 'userId'>;

export async function createInvoice({ title, description, amount, attachment, userId }: InvoiceCreateData) {
  const invoice = await db.invoice.create({
    data: {
      title,
      description,
      amount,
      currencyCode: 'USD',
      attachment,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
  createInvoiceLog(userId, invoice.id, { title, description, amount, currencyCode: 'USD' });
  return invoice;
}

export async function deleteInvoice(id: string, userId: string) {
  const invoice = await db.invoice.delete({ where: { id_userId: { id, userId } } });
  if (invoice.attachment) {
    deleteAttachment(invoice.attachment);
  }
}

type InvoiceUpdateData = Prisma.InvoiceUpdateInput & Prisma.InvoiceIdUserIdCompoundUniqueInput;

export async function updateInvoice({ id, title, description, amount, attachment, userId }: InvoiceUpdateData) {
  const invoice = await db.invoice.update({
    where: { id_userId: { id, userId } },
    data: { title, description, amount, attachment },
  });
  createInvoiceLog(userId, invoice.id, invoice);
  return invoice;
}

export function removeAttachmentFromInvoice(id: string, userId: string, fileName: string) {
  deleteAttachment(fileName);
  return updateInvoice({ id, userId, attachment: null });
}

const invoiceSchema = zod.object({
  title: zod.string(),
  description: zod.string(),
  amount: zod.string(),
});

export function parseInvoice(formData: FormData) {
  const data = Object.fromEntries(formData);
  const { title, description, amount } = invoiceSchema.parse(data);
  const amountNumber = Number.parseFloat(amount);
  if (Number.isNaN(amountNumber)) {
    throw Error('Invalid amount');
  }
  let attachment = formData.get('attachment');
  if (!attachment || typeof attachment !== 'string') {
    attachment = null;
  }
  return { title, description, amount: amountNumber, attachment };
}

type InvoiceLogCreateData = Pick<Invoice, 'title' | 'description' | 'amount' | 'currencyCode'>;

async function createInvoiceLog(
  userId: string,
  invoiceId: string,
  { title, description, amount, currencyCode }: InvoiceLogCreateData,
) {
  return db.invoiceLog.create({
    data: {
      title,
      description,
      amount,
      currencyCode,
      user: { connect: { id: userId } },
      invoice: { connect: { id: invoiceId } },
    },
  });
}
