// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reschedule.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const RescheduleStatusEnum _$rescheduleStatusEnum_PENDING =
    const RescheduleStatusEnum._('PENDING');
const RescheduleStatusEnum _$rescheduleStatusEnum_APPROVED =
    const RescheduleStatusEnum._('APPROVED');
const RescheduleStatusEnum _$rescheduleStatusEnum_REJECTED =
    const RescheduleStatusEnum._('REJECTED');

RescheduleStatusEnum _$rescheduleStatusEnumValueOf(String name) {
  switch (name) {
    case 'PENDING':
      return _$rescheduleStatusEnum_PENDING;
    case 'APPROVED':
      return _$rescheduleStatusEnum_APPROVED;
    case 'REJECTED':
      return _$rescheduleStatusEnum_REJECTED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RescheduleStatusEnum> _$rescheduleStatusEnumValues =
    BuiltSet<RescheduleStatusEnum>(const <RescheduleStatusEnum>[
      _$rescheduleStatusEnum_PENDING,
      _$rescheduleStatusEnum_APPROVED,
      _$rescheduleStatusEnum_REJECTED,
    ]);

Serializer<RescheduleStatusEnum> _$rescheduleStatusEnumSerializer =
    _$RescheduleStatusEnumSerializer();

class _$RescheduleStatusEnumSerializer
    implements PrimitiveSerializer<RescheduleStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PENDING': 'PENDING',
    'APPROVED': 'APPROVED',
    'REJECTED': 'REJECTED',
  };

  @override
  final Iterable<Type> types = const <Type>[RescheduleStatusEnum];
  @override
  final String wireName = 'RescheduleStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    RescheduleStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  RescheduleStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => RescheduleStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$Reschedule extends Reschedule {
  @override
  final String id;
  @override
  final String bookingId;
  @override
  final String sourceClassSlotId;
  @override
  final String targetClassSlotId;
  @override
  final RescheduleStatusEnum status;
  @override
  final DateTime requestedAt;
  @override
  final DateTime? decidedAt;
  @override
  final int version;

  factory _$Reschedule([void Function(RescheduleBuilder)? updates]) =>
      (RescheduleBuilder()..update(updates))._build();

  _$Reschedule._({
    required this.id,
    required this.bookingId,
    required this.sourceClassSlotId,
    required this.targetClassSlotId,
    required this.status,
    required this.requestedAt,
    this.decidedAt,
    required this.version,
  }) : super._();
  @override
  Reschedule rebuild(void Function(RescheduleBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RescheduleBuilder toBuilder() => RescheduleBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Reschedule &&
        id == other.id &&
        bookingId == other.bookingId &&
        sourceClassSlotId == other.sourceClassSlotId &&
        targetClassSlotId == other.targetClassSlotId &&
        status == other.status &&
        requestedAt == other.requestedAt &&
        decidedAt == other.decidedAt &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, bookingId.hashCode);
    _$hash = $jc(_$hash, sourceClassSlotId.hashCode);
    _$hash = $jc(_$hash, targetClassSlotId.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, requestedAt.hashCode);
    _$hash = $jc(_$hash, decidedAt.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Reschedule')
          ..add('id', id)
          ..add('bookingId', bookingId)
          ..add('sourceClassSlotId', sourceClassSlotId)
          ..add('targetClassSlotId', targetClassSlotId)
          ..add('status', status)
          ..add('requestedAt', requestedAt)
          ..add('decidedAt', decidedAt)
          ..add('version', version))
        .toString();
  }
}

class RescheduleBuilder implements Builder<Reschedule, RescheduleBuilder> {
  _$Reschedule? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _bookingId;
  String? get bookingId => _$this._bookingId;
  set bookingId(String? bookingId) => _$this._bookingId = bookingId;

  String? _sourceClassSlotId;
  String? get sourceClassSlotId => _$this._sourceClassSlotId;
  set sourceClassSlotId(String? sourceClassSlotId) =>
      _$this._sourceClassSlotId = sourceClassSlotId;

  String? _targetClassSlotId;
  String? get targetClassSlotId => _$this._targetClassSlotId;
  set targetClassSlotId(String? targetClassSlotId) =>
      _$this._targetClassSlotId = targetClassSlotId;

  RescheduleStatusEnum? _status;
  RescheduleStatusEnum? get status => _$this._status;
  set status(RescheduleStatusEnum? status) => _$this._status = status;

  DateTime? _requestedAt;
  DateTime? get requestedAt => _$this._requestedAt;
  set requestedAt(DateTime? requestedAt) => _$this._requestedAt = requestedAt;

  DateTime? _decidedAt;
  DateTime? get decidedAt => _$this._decidedAt;
  set decidedAt(DateTime? decidedAt) => _$this._decidedAt = decidedAt;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  RescheduleBuilder() {
    Reschedule._defaults(this);
  }

  RescheduleBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _bookingId = $v.bookingId;
      _sourceClassSlotId = $v.sourceClassSlotId;
      _targetClassSlotId = $v.targetClassSlotId;
      _status = $v.status;
      _requestedAt = $v.requestedAt;
      _decidedAt = $v.decidedAt;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Reschedule other) {
    _$v = other as _$Reschedule;
  }

  @override
  void update(void Function(RescheduleBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Reschedule build() => _build();

  _$Reschedule _build() {
    final _$result =
        _$v ??
        _$Reschedule._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'Reschedule', 'id'),
          bookingId: BuiltValueNullFieldError.checkNotNull(
            bookingId,
            r'Reschedule',
            'bookingId',
          ),
          sourceClassSlotId: BuiltValueNullFieldError.checkNotNull(
            sourceClassSlotId,
            r'Reschedule',
            'sourceClassSlotId',
          ),
          targetClassSlotId: BuiltValueNullFieldError.checkNotNull(
            targetClassSlotId,
            r'Reschedule',
            'targetClassSlotId',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'Reschedule',
            'status',
          ),
          requestedAt: BuiltValueNullFieldError.checkNotNull(
            requestedAt,
            r'Reschedule',
            'requestedAt',
          ),
          decidedAt: decidedAt,
          version: BuiltValueNullFieldError.checkNotNull(
            version,
            r'Reschedule',
            'version',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
