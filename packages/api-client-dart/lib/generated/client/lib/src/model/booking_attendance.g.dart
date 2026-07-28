// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_attendance.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const BookingAttendanceSource_Enum _$bookingAttendanceSourceEnum_QR =
    const BookingAttendanceSource_Enum._('QR');
const BookingAttendanceSource_Enum _$bookingAttendanceSourceEnum_BACKFILL =
    const BookingAttendanceSource_Enum._('BACKFILL');

BookingAttendanceSource_Enum _$bookingAttendanceSourceEnumValueOf(String name) {
  switch (name) {
    case 'QR':
      return _$bookingAttendanceSourceEnum_QR;
    case 'BACKFILL':
      return _$bookingAttendanceSourceEnum_BACKFILL;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<BookingAttendanceSource_Enum>
_$bookingAttendanceSourceEnumValues = BuiltSet<BookingAttendanceSource_Enum>(
  const <BookingAttendanceSource_Enum>[
    _$bookingAttendanceSourceEnum_QR,
    _$bookingAttendanceSourceEnum_BACKFILL,
  ],
);

Serializer<BookingAttendanceSource_Enum>
_$bookingAttendanceSourceEnumSerializer =
    _$BookingAttendanceSource_EnumSerializer();

class _$BookingAttendanceSource_EnumSerializer
    implements PrimitiveSerializer<BookingAttendanceSource_Enum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'QR': 'QR',
    'BACKFILL': 'BACKFILL',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'QR': 'QR',
    'BACKFILL': 'BACKFILL',
  };

  @override
  final Iterable<Type> types = const <Type>[BookingAttendanceSource_Enum];
  @override
  final String wireName = 'BookingAttendanceSource_Enum';

  @override
  Object serialize(
    Serializers serializers,
    BookingAttendanceSource_Enum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  BookingAttendanceSource_Enum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => BookingAttendanceSource_Enum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$BookingAttendance extends BookingAttendance {
  @override
  final DateTime? checkedInAt;
  @override
  final BookingAttendanceSource_Enum? source_;

  factory _$BookingAttendance([
    void Function(BookingAttendanceBuilder)? updates,
  ]) => (BookingAttendanceBuilder()..update(updates))._build();

  _$BookingAttendance._({this.checkedInAt, this.source_}) : super._();
  @override
  BookingAttendance rebuild(void Function(BookingAttendanceBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BookingAttendanceBuilder toBuilder() =>
      BookingAttendanceBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BookingAttendance &&
        checkedInAt == other.checkedInAt &&
        source_ == other.source_;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, checkedInAt.hashCode);
    _$hash = $jc(_$hash, source_.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BookingAttendance')
          ..add('checkedInAt', checkedInAt)
          ..add('source_', source_))
        .toString();
  }
}

class BookingAttendanceBuilder
    implements Builder<BookingAttendance, BookingAttendanceBuilder> {
  _$BookingAttendance? _$v;

  DateTime? _checkedInAt;
  DateTime? get checkedInAt => _$this._checkedInAt;
  set checkedInAt(DateTime? checkedInAt) => _$this._checkedInAt = checkedInAt;

  BookingAttendanceSource_Enum? _source_;
  BookingAttendanceSource_Enum? get source_ => _$this._source_;
  set source_(BookingAttendanceSource_Enum? source_) =>
      _$this._source_ = source_;

  BookingAttendanceBuilder() {
    BookingAttendance._defaults(this);
  }

  BookingAttendanceBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _checkedInAt = $v.checkedInAt;
      _source_ = $v.source_;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BookingAttendance other) {
    _$v = other as _$BookingAttendance;
  }

  @override
  void update(void Function(BookingAttendanceBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BookingAttendance build() => _build();

  _$BookingAttendance _build() {
    final _$result =
        _$v ??
        _$BookingAttendance._(checkedInAt: checkedInAt, source_: source_);
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
