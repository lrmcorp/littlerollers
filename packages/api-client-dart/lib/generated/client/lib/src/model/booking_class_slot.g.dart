// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'booking_class_slot.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BookingClassSlot extends BookingClassSlot {
  @override
  final String id;
  @override
  final DateTime startAt;
  @override
  final DateTime endAt;
  @override
  final String timezone;
  @override
  final String status;
  @override
  final VoucherPackagesInner classType;

  factory _$BookingClassSlot([
    void Function(BookingClassSlotBuilder)? updates,
  ]) => (BookingClassSlotBuilder()..update(updates))._build();

  _$BookingClassSlot._({
    required this.id,
    required this.startAt,
    required this.endAt,
    required this.timezone,
    required this.status,
    required this.classType,
  }) : super._();
  @override
  BookingClassSlot rebuild(void Function(BookingClassSlotBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BookingClassSlotBuilder toBuilder() =>
      BookingClassSlotBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BookingClassSlot &&
        id == other.id &&
        startAt == other.startAt &&
        endAt == other.endAt &&
        timezone == other.timezone &&
        status == other.status &&
        classType == other.classType;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, startAt.hashCode);
    _$hash = $jc(_$hash, endAt.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, classType.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BookingClassSlot')
          ..add('id', id)
          ..add('startAt', startAt)
          ..add('endAt', endAt)
          ..add('timezone', timezone)
          ..add('status', status)
          ..add('classType', classType))
        .toString();
  }
}

class BookingClassSlotBuilder
    implements Builder<BookingClassSlot, BookingClassSlotBuilder> {
  _$BookingClassSlot? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  DateTime? _startAt;
  DateTime? get startAt => _$this._startAt;
  set startAt(DateTime? startAt) => _$this._startAt = startAt;

  DateTime? _endAt;
  DateTime? get endAt => _$this._endAt;
  set endAt(DateTime? endAt) => _$this._endAt = endAt;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(String? timezone) => _$this._timezone = timezone;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  VoucherPackagesInnerBuilder? _classType;
  VoucherPackagesInnerBuilder get classType =>
      _$this._classType ??= VoucherPackagesInnerBuilder();
  set classType(VoucherPackagesInnerBuilder? classType) =>
      _$this._classType = classType;

  BookingClassSlotBuilder() {
    BookingClassSlot._defaults(this);
  }

  BookingClassSlotBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _startAt = $v.startAt;
      _endAt = $v.endAt;
      _timezone = $v.timezone;
      _status = $v.status;
      _classType = $v.classType.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BookingClassSlot other) {
    _$v = other as _$BookingClassSlot;
  }

  @override
  void update(void Function(BookingClassSlotBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BookingClassSlot build() => _build();

  _$BookingClassSlot _build() {
    _$BookingClassSlot _$result;
    try {
      _$result =
          _$v ??
          _$BookingClassSlot._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'BookingClassSlot',
              'id',
            ),
            startAt: BuiltValueNullFieldError.checkNotNull(
              startAt,
              r'BookingClassSlot',
              'startAt',
            ),
            endAt: BuiltValueNullFieldError.checkNotNull(
              endAt,
              r'BookingClassSlot',
              'endAt',
            ),
            timezone: BuiltValueNullFieldError.checkNotNull(
              timezone,
              r'BookingClassSlot',
              'timezone',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'BookingClassSlot',
              'status',
            ),
            classType: classType.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'classType';
        classType.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'BookingClassSlot',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
