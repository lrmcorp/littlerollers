import { assertMysqlbinlogGtidContinuity, decodeMysqlbinlogText } from '../../prisma/v1-binlog';

describe('v1 mysqlbinlog decoder', () => {
  it('decodes FULL row-image insert, update, and delete in GTID order', () => {
    const columns = [
      'id',
      'nama',
      'deskripsi',
      'no_hp',
      'alamat',
      'email',
      'url_location',
      'image',
      'created_at',
      'updated_at',
      'deleted_at',
      'nama_bank',
      'no_rekening',
      'atas_nama',
    ];
    const row = (name: string) =>
      columns
        .map(
          (_, index) =>
            `###   @${index + 1}=${index === 0 ? '7' : index === 1 ? `'${name}'` : 'NULL'} /* meta */`,
        )
        .join('\n');
    const text = [
      "SET @@SESSION.GTID_NEXT= 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:1'/*!*/;",
      '### INSERT INTO `dailydose`.`locations`',
      '### SET',
      row('Jakarta'),
      "SET @@SESSION.GTID_NEXT= 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:2'/*!*/;",
      '### UPDATE `dailydose`.`locations`',
      '### WHERE',
      row('Jakarta'),
      '### SET',
      row('Jakarta Baru'),
      "SET @@SESSION.GTID_NEXT= 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:3'/*!*/;",
      '### DELETE FROM `dailydose`.`locations`',
      '### WHERE',
      row('Jakarta Baru'),
    ].join('\n');
    const events = decodeMysqlbinlogText(text, {
      transactionOrderStart: 0n,
      binlogFile: 'mysql-bin.000001',
    });
    expect(events.map((event) => event.operation)).toEqual(['INSERT', 'UPDATE', 'DELETE']);
    expect(events.map((event) => event.transactionOrder)).toEqual(['1', '2', '3']);
    expect(events[1]?.before?.nama).toBe('Jakarta');
    expect(events[1]?.after?.nama).toBe('Jakarta Baru');
  });

  it('rejects non-FULL row images', () => {
    expect(() =>
      decodeMysqlbinlogText(
        [
          "SET @@SESSION.GTID_NEXT= 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:1'/*!*/;",
          '### INSERT INTO `dailydose`.`locations`',
          '### SET',
          '###   @1=7 /* meta */',
        ].join('\n'),
        { transactionOrderStart: 0n, binlogFile: 'mysql-bin.000001' },
      ),
    ).toThrow('BINLOG_FULL_ROW_IMAGE_REQUIRED');
  });

  it('normalizes numeric MySQL TIMESTAMP row values to ISO timestamps', () => {
    const columns = ['id', 'name', 'guard_name', 'created_at', 'updated_at'];
    const row = columns
      .map((_, index) => {
        const value = index === 0 ? '1' : index < 3 ? "'role'" : '1785649470';
        return `###   @${index + 1}=${value} /* meta */`;
      })
      .join('\n');
    const [event] = decodeMysqlbinlogText(
      [
        "SET @@SESSION.GTID_NEXT= 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:1'/*!*/;",
        '### INSERT INTO `dailydose`.`roles`',
        '### SET',
        row,
      ].join('\n'),
      { transactionOrderStart: 0n, binlogFile: 'mysql-bin.000001' },
    );
    expect(event?.after?.created_at).toBe('2026-08-02T05:44:30.000Z');
    expect(event?.after?.updated_at).toBe('2026-08-02T05:44:30.000Z');
  });

  it('accepts continuous GTIDs and rejects a missing transaction', () => {
    const sid = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    expect(
      assertMysqlbinlogGtidContinuity(
        [`SET @@SESSION.GTID_NEXT= '${sid}:4'`, `SET @@SESSION.GTID_NEXT= '${sid}:5'`].join('\n'),
        `${sid}:1-3`,
      ),
    ).toEqual([`${sid}:4`, `${sid}:5`]);
    expect(() =>
      assertMysqlbinlogGtidContinuity(`SET @@SESSION.GTID_NEXT= '${sid}:5'`, `${sid}:1-3`),
    ).toThrow('BINLOG_GTID_GAP');
  });
});
