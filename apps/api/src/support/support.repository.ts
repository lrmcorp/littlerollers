import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

type Transaction = Prisma.TransactionClient;

@Injectable()
export class SupportRepository {
  constructor(private readonly db: PrismaService) {}

  /**
   * Mengambil daftar kasus bantuan sesuai scope dan filter
   * yang sudah ditentukan oleh service.
   */
  daftarKasus(
    where: Prisma.SupportCaseWhereInput,
    cursor?: string,
  ) {
    return this.db.supportCase.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: 21,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        tags: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            displayName: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            notes: true,
          },
        },
      },
    });
  }

  /**
   * Mengambil detail lengkap sebuah kasus bantuan.
   */
  detailKasus(where: Prisma.SupportCaseWhereInput) {
    return this.db.supportCase.findFirst({
      where,
      include: {
        customer: {
          select: {
            id: true,
            displayName: true,
            email: true,
            phoneE164: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            displayName: true,
          },
        },
        notes: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Mengambil kasus bantuan untuk proses perubahan.
   */
  cariKasus(where: Prisma.SupportCaseWhereInput) {
    return this.db.supportCase.findFirst({
      where,
    });
  }

  /**
   * Memastikan customer yang dipilih benar-benar memiliki role CUSTOMER.
   */
  cariCustomer(customerUserId: string) {
    return this.db.user.findFirst({
      where: {
        id: customerUserId,
        roles: {
          some: {
            role: 'CUSTOMER',
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  /**
   * Memastikan petugas aktif dan, bila kasus terikat cabang,
   * petugas mempunyai assignment aktif pada cabang tersebut.
   */
  cariPetugas(
    assignedUserId: string,
    branchId?: string | null,
  ) {
    return this.db.user.findFirst({
      where: {
        id: assignedUserId,
        status: 'ACTIVE',
        roles: {
          some: {
            role: {
              not: 'CUSTOMER',
            },
          },
        },
        ...(branchId
          ? {
              assignments: {
                some: {
                  branchId,
                  activeUntil: null,
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
      },
    });
  }

  /**
   * Membuat kasus bantuan di dalam transaksi yang sedang berjalan.
   */
  buatKasus(
    tx: Transaction,
    data: Prisma.SupportCaseUncheckedCreateInput,
  ) {
    return tx.supportCase.create({
      data,
    });
  }

  /**
   * Mengubah kasus menggunakan optimistic locking melalui version.
   */
  ubahKasus(
    tx: Transaction,
    id: string,
    expectedVersion: number,
    data: Prisma.SupportCaseUncheckedUpdateManyInput,
  ) {
    return tx.supportCase.updateMany({
      where: {
        id,
        version: expectedVersion,
      },
      data,
    });
  }

  /**
   * Mengambil kembali kasus setelah perubahan berhasil disimpan.
   */
  cariKasusDalamTransaksi(
    tx: Transaction,
    id: string,
  ) {
    return tx.supportCase.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Membuat catatan internal untuk sebuah kasus bantuan.
   */
  buatCatatanInternal(
    tx: Transaction,
    data: Prisma.SupportCaseNoteUncheckedCreateInput,
  ) {
    return tx.supportCaseNote.create({
      data,
    });
  }
}
