// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_adjustment.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const SessionAdjustmentStatusEnum _$sessionAdjustmentStatusEnum_PENDING =
    const SessionAdjustmentStatusEnum._('PENDING');
const SessionAdjustmentStatusEnum _$sessionAdjustmentStatusEnum_APPROVED =
    const SessionAdjustmentStatusEnum._('APPROVED');
const SessionAdjustmentStatusEnum _$sessionAdjustmentStatusEnum_POSTED =
    const SessionAdjustmentStatusEnum._('POSTED');
const SessionAdjustmentStatusEnum _$sessionAdjustmentStatusEnum_REJECTED =
    const SessionAdjustmentStatusEnum._('REJECTED');

SessionAdjustmentStatusEnum _$sessionAdjustmentStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$sessionAdjustmentStatusEnum_PENDING;
    case 'APPROVED':
      return _$sessionAdjustmentStatusEnum_APPROVED;
    case 'POSTED':
      return _$sessionAdjustmentStatusEnum_POSTED;
    case 'REJECTED':
      return _$sessionAdjustmentStatusEnum_REJECTED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<SessionAdjustmentStatusEnum>
_$sessionAdjustmentStatusEnumValues =
    BuiltSet<SessionAdjustmentStatusEnum>(const <SessionAdjustmentStatusEnum>[
      _$sessionAdjustmentStatusEnum_PENDING,
      _$sessionAdjustmentStatusEnum_APPROVED,
      _$sessionAdjustmentStatusEnum_POSTED,
      _$sessionAdjustmentStatusEnum_REJECTED,
    ]);

Serializer<SessionAdjustmentStatusEnum>
_$sessionAdjustmentStatusEnumSerializer =
    _$SessionAdjustmentStatusEnumSerializer();

class _$SessionAdjustmentStatusEnumSerializer
    implements PrimitiveSerializer<SessionAdjustmentStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'POSTED': 'POSTED',
    'REJECTED': 'REJECTED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'POSTED': 'POSTED',
    'REJECTED': 'REJECTED',
  };

  @override
  final Iterable<Type> types = const <Type>[SessionAdjustmentStatusEnum];
  @override
  final String wireName = 'SessionAdjustmentStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    SessionAdjustmentStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  SessionAdjustmentStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => SessionAdjustmentStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$SessionAdjustment extends SessionAdjustment {
  @override
  final String id;
  @override
  final String customerPackageId;
  @override
  final int quantity;
  @override
  final String reason;
  @override
  final String requestedBy;
  @override
  final String? approvedBy;
  @override
  final SessionAdjustmentStatusEnum status;
  @override
  final LedgerEntry? ledgerEntry;

  factory _$SessionAdjustment([
    void Function(SessionAdjustmentBuilder)? updates,
  ]) => (SessionAdjustmentBuilder()..update(updates))._build();

  _$SessionAdjustment._({
    required this.id,
    required this.customerPackageId,
    required this.quantity,
    required this.reason,
    required this.requestedBy,
    this.approvedBy,
    required this.status,
    this.ledgerEntry,
  }) : super._();
  @override
  SessionAdjustment rebuild(void Function(SessionAdjustmentBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SessionAdjustmentBuilder toBuilder() =>
      SessionAdjustmentBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SessionAdjustment &&
        id == other.id &&
        customerPackageId == other.customerPackageId &&
        quantity == other.quantity &&
        reason == other.reason &&
        requestedBy == other.requestedBy &&
        approvedBy == other.approvedBy &&
        status == other.status &&
        ledgerEntry == other.ledgerEntry;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, customerPackageId.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jc(_$hash, requestedBy.hashCode);
    _$hash = $jc(_$hash, approvedBy.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, ledgerEntry.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SessionAdjustment')
          ..add('id', id)
          ..add('customerPackageId', customerPackageId)
          ..add('quantity', quantity)
          ..add('reason', reason)
          ..add('requestedBy', requestedBy)
          ..add('approvedBy', approvedBy)
          ..add('status', status)
          ..add('ledgerEntry', ledgerEntry))
        .toString();
  }
}

class SessionAdjustmentBuilder
    implements Builder<SessionAdjustment, SessionAdjustmentBuilder> {
  _$SessionAdjustment? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _customerPackageId;
  String? get customerPackageId => _$this._customerPackageId;
  set customerPackageId(String? customerPackageId) =>
      _$this._customerPackageId = customerPackageId;

  int? _quantity;
  int? get quantity => _$this._quantity;
  set quantity(int? quantity) => _$this._quantity = quantity;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  String? _requestedBy;
  String? get requestedBy => _$this._requestedBy;
  set requestedBy(String? requestedBy) => _$this._requestedBy = requestedBy;

  String? _approvedBy;
  String? get approvedBy => _$this._approvedBy;
  set approvedBy(String? approvedBy) => _$this._approvedBy = approvedBy;

  SessionAdjustmentStatusEnum? _status;
  SessionAdjustmentStatusEnum? get status => _$this._status;
  set status(SessionAdjustmentStatusEnum? status) => _$this._status = status;

  LedgerEntryBuilder? _ledgerEntry;
  LedgerEntryBuilder get ledgerEntry =>
      _$this._ledgerEntry ??= LedgerEntryBuilder();
  set ledgerEntry(LedgerEntryBuilder? ledgerEntry) =>
      _$this._ledgerEntry = ledgerEntry;

  SessionAdjustmentBuilder() {
    SessionAdjustment._defaults(this);
  }

  SessionAdjustmentBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _customerPackageId = $v.customerPackageId;
      _quantity = $v.quantity;
      _reason = $v.reason;
      _requestedBy = $v.requestedBy;
      _approvedBy = $v.approvedBy;
      _status = $v.status;
      _ledgerEntry = $v.ledgerEntry?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SessionAdjustment other) {
    _$v = other as _$SessionAdjustment;
  }

  @override
  void update(void Function(SessionAdjustmentBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SessionAdjustment build() => _build();

  _$SessionAdjustment _build() {
    _$SessionAdjustment _$result;
    try {
      _$result =
          _$v ??
          _$SessionAdjustment._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'SessionAdjustment',
              'id',
            ),
            customerPackageId: BuiltValueNullFieldError.checkNotNull(
              customerPackageId,
              r'SessionAdjustment',
              'customerPackageId',
            ),
            quantity: BuiltValueNullFieldError.checkNotNull(
              quantity,
              r'SessionAdjustment',
              'quantity',
            ),
            reason: BuiltValueNullFieldError.checkNotNull(
              reason,
              r'SessionAdjustment',
              'reason',
            ),
            requestedBy: BuiltValueNullFieldError.checkNotNull(
              requestedBy,
              r'SessionAdjustment',
              'requestedBy',
            ),
            approvedBy: approvedBy,
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'SessionAdjustment',
              'status',
            ),
            ledgerEntry: _ledgerEntry?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'ledgerEntry';
        _ledgerEntry?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'SessionAdjustment',
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
