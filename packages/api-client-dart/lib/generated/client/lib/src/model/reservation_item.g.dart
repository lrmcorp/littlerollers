// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reservation_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReservationItem extends ReservationItem {
  @override
  final String id;
  @override
  final int quantity;
  @override
  final DateTime createdAt;
  @override
  final String? bookingId;
  @override
  final String? bookingStatus;
  @override
  final String? className;
  @override
  final String? branchName;
  @override
  final DateTime? startsAt;

  factory _$ReservationItem([void Function(ReservationItemBuilder)? updates]) =>
      (ReservationItemBuilder()..update(updates))._build();

  _$ReservationItem._({
    required this.id,
    required this.quantity,
    required this.createdAt,
    this.bookingId,
    this.bookingStatus,
    this.className,
    this.branchName,
    this.startsAt,
  }) : super._();
  @override
  ReservationItem rebuild(void Function(ReservationItemBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ReservationItemBuilder toBuilder() => ReservationItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReservationItem &&
        id == other.id &&
        quantity == other.quantity &&
        createdAt == other.createdAt &&
        bookingId == other.bookingId &&
        bookingStatus == other.bookingStatus &&
        className == other.className &&
        branchName == other.branchName &&
        startsAt == other.startsAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, bookingId.hashCode);
    _$hash = $jc(_$hash, bookingStatus.hashCode);
    _$hash = $jc(_$hash, className.hashCode);
    _$hash = $jc(_$hash, branchName.hashCode);
    _$hash = $jc(_$hash, startsAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ReservationItem')
          ..add('id', id)
          ..add('quantity', quantity)
          ..add('createdAt', createdAt)
          ..add('bookingId', bookingId)
          ..add('bookingStatus', bookingStatus)
          ..add('className', className)
          ..add('branchName', branchName)
          ..add('startsAt', startsAt))
        .toString();
  }
}

class ReservationItemBuilder
    implements Builder<ReservationItem, ReservationItemBuilder> {
  _$ReservationItem? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  int? _quantity;
  int? get quantity => _$this._quantity;
  set quantity(int? quantity) => _$this._quantity = quantity;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  String? _bookingId;
  String? get bookingId => _$this._bookingId;
  set bookingId(String? bookingId) => _$this._bookingId = bookingId;

  String? _bookingStatus;
  String? get bookingStatus => _$this._bookingStatus;
  set bookingStatus(String? bookingStatus) =>
      _$this._bookingStatus = bookingStatus;

  String? _className;
  String? get className => _$this._className;
  set className(String? className) => _$this._className = className;

  String? _branchName;
  String? get branchName => _$this._branchName;
  set branchName(String? branchName) => _$this._branchName = branchName;

  DateTime? _startsAt;
  DateTime? get startsAt => _$this._startsAt;
  set startsAt(DateTime? startsAt) => _$this._startsAt = startsAt;

  ReservationItemBuilder() {
    ReservationItem._defaults(this);
  }

  ReservationItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _quantity = $v.quantity;
      _createdAt = $v.createdAt;
      _bookingId = $v.bookingId;
      _bookingStatus = $v.bookingStatus;
      _className = $v.className;
      _branchName = $v.branchName;
      _startsAt = $v.startsAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ReservationItem other) {
    _$v = other as _$ReservationItem;
  }

  @override
  void update(void Function(ReservationItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReservationItem build() => _build();

  _$ReservationItem _build() {
    final _$result =
        _$v ??
        _$ReservationItem._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'ReservationItem',
            'id',
          ),
          quantity: BuiltValueNullFieldError.checkNotNull(
            quantity,
            r'ReservationItem',
            'quantity',
          ),
          createdAt: BuiltValueNullFieldError.checkNotNull(
            createdAt,
            r'ReservationItem',
            'createdAt',
          ),
          bookingId: bookingId,
          bookingStatus: bookingStatus,
          className: className,
          branchName: branchName,
          startsAt: startsAt,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
