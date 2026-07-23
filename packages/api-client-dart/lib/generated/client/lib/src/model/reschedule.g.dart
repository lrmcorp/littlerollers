// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reschedule.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const RescheduleRequestReasonCodeEnum
_$rescheduleRequestReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT =
    const RescheduleRequestReasonCodeEnum._('CUSTOMER_SCHEDULE_CONFLICT');
const RescheduleRequestReasonCodeEnum
_$rescheduleRequestReasonCodeEnum_WRONG_CLASS_SELECTED =
    const RescheduleRequestReasonCodeEnum._('WRONG_CLASS_SELECTED');
const RescheduleRequestReasonCodeEnum
_$rescheduleRequestReasonCodeEnum_PERSONAL_UNAVAILABLE =
    const RescheduleRequestReasonCodeEnum._('PERSONAL_UNAVAILABLE');

RescheduleRequestReasonCodeEnum _$rescheduleRequestReasonCodeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'CUSTOMER_SCHEDULE_CONFLICT':
      return _$rescheduleRequestReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT;
    case 'WRONG_CLASS_SELECTED':
      return _$rescheduleRequestReasonCodeEnum_WRONG_CLASS_SELECTED;
    case 'PERSONAL_UNAVAILABLE':
      return _$rescheduleRequestReasonCodeEnum_PERSONAL_UNAVAILABLE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RescheduleRequestReasonCodeEnum>
_$rescheduleRequestReasonCodeEnumValues =
    BuiltSet<RescheduleRequestReasonCodeEnum>(
      const <RescheduleRequestReasonCodeEnum>[
        _$rescheduleRequestReasonCodeEnum_CUSTOMER_SCHEDULE_CONFLICT,
        _$rescheduleRequestReasonCodeEnum_WRONG_CLASS_SELECTED,
        _$rescheduleRequestReasonCodeEnum_PERSONAL_UNAVAILABLE,
      ],
    );

const RescheduleDecisionReasonCodeEnum
_$rescheduleDecisionReasonCodeEnum_ELIGIBILITY_VERIFIED =
    const RescheduleDecisionReasonCodeEnum._('ELIGIBILITY_VERIFIED');
const RescheduleDecisionReasonCodeEnum
_$rescheduleDecisionReasonCodeEnum_TARGET_UNAVAILABLE =
    const RescheduleDecisionReasonCodeEnum._('TARGET_UNAVAILABLE');
const RescheduleDecisionReasonCodeEnum
_$rescheduleDecisionReasonCodeEnum_OUTSIDE_POLICY =
    const RescheduleDecisionReasonCodeEnum._('OUTSIDE_POLICY');
const RescheduleDecisionReasonCodeEnum
_$rescheduleDecisionReasonCodeEnum_OUT_OF_SCOPE =
    const RescheduleDecisionReasonCodeEnum._('OUT_OF_SCOPE');

RescheduleDecisionReasonCodeEnum _$rescheduleDecisionReasonCodeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'ELIGIBILITY_VERIFIED':
      return _$rescheduleDecisionReasonCodeEnum_ELIGIBILITY_VERIFIED;
    case 'TARGET_UNAVAILABLE':
      return _$rescheduleDecisionReasonCodeEnum_TARGET_UNAVAILABLE;
    case 'OUTSIDE_POLICY':
      return _$rescheduleDecisionReasonCodeEnum_OUTSIDE_POLICY;
    case 'OUT_OF_SCOPE':
      return _$rescheduleDecisionReasonCodeEnum_OUT_OF_SCOPE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RescheduleDecisionReasonCodeEnum>
_$rescheduleDecisionReasonCodeEnumValues =
    BuiltSet<RescheduleDecisionReasonCodeEnum>(
      const <RescheduleDecisionReasonCodeEnum>[
        _$rescheduleDecisionReasonCodeEnum_ELIGIBILITY_VERIFIED,
        _$rescheduleDecisionReasonCodeEnum_TARGET_UNAVAILABLE,
        _$rescheduleDecisionReasonCodeEnum_OUTSIDE_POLICY,
        _$rescheduleDecisionReasonCodeEnum_OUT_OF_SCOPE,
      ],
    );

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

const RescheduleEntitledAtRequestEnum _$rescheduleEntitledAtRequestEnum_true_ =
    const RescheduleEntitledAtRequestEnum._('true_');

RescheduleEntitledAtRequestEnum _$rescheduleEntitledAtRequestEnumValueOf(
  String name,
) {
  switch (name) {
    case 'true_':
      return _$rescheduleEntitledAtRequestEnum_true_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RescheduleEntitledAtRequestEnum>
_$rescheduleEntitledAtRequestEnumValues =
    BuiltSet<RescheduleEntitledAtRequestEnum>(
      const <RescheduleEntitledAtRequestEnum>[
        _$rescheduleEntitledAtRequestEnum_true_,
      ],
    );

Serializer<RescheduleRequestReasonCodeEnum>
_$rescheduleRequestReasonCodeEnumSerializer =
    _$RescheduleRequestReasonCodeEnumSerializer();
Serializer<RescheduleDecisionReasonCodeEnum>
_$rescheduleDecisionReasonCodeEnumSerializer =
    _$RescheduleDecisionReasonCodeEnumSerializer();
Serializer<RescheduleStatusEnum> _$rescheduleStatusEnumSerializer =
    _$RescheduleStatusEnumSerializer();
Serializer<RescheduleEntitledAtRequestEnum>
_$rescheduleEntitledAtRequestEnumSerializer =
    _$RescheduleEntitledAtRequestEnumSerializer();

class _$RescheduleRequestReasonCodeEnumSerializer
    implements PrimitiveSerializer<RescheduleRequestReasonCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'CUSTOMER_SCHEDULE_CONFLICT': 'CUSTOMER_SCHEDULE_CONFLICT',
    'WRONG_CLASS_SELECTED': 'WRONG_CLASS_SELECTED',
    'PERSONAL_UNAVAILABLE': 'PERSONAL_UNAVAILABLE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'CUSTOMER_SCHEDULE_CONFLICT': 'CUSTOMER_SCHEDULE_CONFLICT',
    'WRONG_CLASS_SELECTED': 'WRONG_CLASS_SELECTED',
    'PERSONAL_UNAVAILABLE': 'PERSONAL_UNAVAILABLE',
  };

  @override
  final Iterable<Type> types = const <Type>[RescheduleRequestReasonCodeEnum];
  @override
  final String wireName = 'RescheduleRequestReasonCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    RescheduleRequestReasonCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  RescheduleRequestReasonCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => RescheduleRequestReasonCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$RescheduleDecisionReasonCodeEnumSerializer
    implements PrimitiveSerializer<RescheduleDecisionReasonCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ELIGIBILITY_VERIFIED': 'ELIGIBILITY_VERIFIED',
    'TARGET_UNAVAILABLE': 'TARGET_UNAVAILABLE',
    'OUTSIDE_POLICY': 'OUTSIDE_POLICY',
    'OUT_OF_SCOPE': 'OUT_OF_SCOPE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ELIGIBILITY_VERIFIED': 'ELIGIBILITY_VERIFIED',
    'TARGET_UNAVAILABLE': 'TARGET_UNAVAILABLE',
    'OUTSIDE_POLICY': 'OUTSIDE_POLICY',
    'OUT_OF_SCOPE': 'OUT_OF_SCOPE',
  };

  @override
  final Iterable<Type> types = const <Type>[RescheduleDecisionReasonCodeEnum];
  @override
  final String wireName = 'RescheduleDecisionReasonCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    RescheduleDecisionReasonCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  RescheduleDecisionReasonCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => RescheduleDecisionReasonCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

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

class _$RescheduleEntitledAtRequestEnumSerializer
    implements PrimitiveSerializer<RescheduleEntitledAtRequestEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'true_': 'true',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'true': 'true_',
  };

  @override
  final Iterable<Type> types = const <Type>[RescheduleEntitledAtRequestEnum];
  @override
  final String wireName = 'RescheduleEntitledAtRequestEnum';

  @override
  Object serialize(
    Serializers serializers,
    RescheduleEntitledAtRequestEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  RescheduleEntitledAtRequestEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => RescheduleEntitledAtRequestEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$Reschedule extends Reschedule {
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String bookingId;
  @override
  final String sourceClassSlotId;
  @override
  final String targetClassSlotId;
  @override
  final String requestedById;
  @override
  final String? decidedById;
  @override
  final RescheduleRequestReasonCodeEnum requestReasonCode;
  @override
  final RescheduleDecisionReasonCodeEnum? decisionReasonCode;
  @override
  final RescheduleStatusEnum status;
  @override
  final DateTime entitlementCutoffAt;
  @override
  final RescheduleEntitledAtRequestEnum entitledAtRequest;
  @override
  final DateTime requestedAt;
  @override
  final DateTime? decidedAt;
  @override
  final int version;
  @override
  final bool? idempotentReplay;

  factory _$Reschedule([void Function(RescheduleBuilder)? updates]) =>
      (RescheduleBuilder()..update(updates))._build();

  _$Reschedule._({
    required this.id,
    required this.branchId,
    required this.bookingId,
    required this.sourceClassSlotId,
    required this.targetClassSlotId,
    required this.requestedById,
    this.decidedById,
    required this.requestReasonCode,
    this.decisionReasonCode,
    required this.status,
    required this.entitlementCutoffAt,
    required this.entitledAtRequest,
    required this.requestedAt,
    this.decidedAt,
    required this.version,
    this.idempotentReplay,
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
        branchId == other.branchId &&
        bookingId == other.bookingId &&
        sourceClassSlotId == other.sourceClassSlotId &&
        targetClassSlotId == other.targetClassSlotId &&
        requestedById == other.requestedById &&
        decidedById == other.decidedById &&
        requestReasonCode == other.requestReasonCode &&
        decisionReasonCode == other.decisionReasonCode &&
        status == other.status &&
        entitlementCutoffAt == other.entitlementCutoffAt &&
        entitledAtRequest == other.entitledAtRequest &&
        requestedAt == other.requestedAt &&
        decidedAt == other.decidedAt &&
        version == other.version &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, bookingId.hashCode);
    _$hash = $jc(_$hash, sourceClassSlotId.hashCode);
    _$hash = $jc(_$hash, targetClassSlotId.hashCode);
    _$hash = $jc(_$hash, requestedById.hashCode);
    _$hash = $jc(_$hash, decidedById.hashCode);
    _$hash = $jc(_$hash, requestReasonCode.hashCode);
    _$hash = $jc(_$hash, decisionReasonCode.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, entitlementCutoffAt.hashCode);
    _$hash = $jc(_$hash, entitledAtRequest.hashCode);
    _$hash = $jc(_$hash, requestedAt.hashCode);
    _$hash = $jc(_$hash, decidedAt.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Reschedule')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('bookingId', bookingId)
          ..add('sourceClassSlotId', sourceClassSlotId)
          ..add('targetClassSlotId', targetClassSlotId)
          ..add('requestedById', requestedById)
          ..add('decidedById', decidedById)
          ..add('requestReasonCode', requestReasonCode)
          ..add('decisionReasonCode', decisionReasonCode)
          ..add('status', status)
          ..add('entitlementCutoffAt', entitlementCutoffAt)
          ..add('entitledAtRequest', entitledAtRequest)
          ..add('requestedAt', requestedAt)
          ..add('decidedAt', decidedAt)
          ..add('version', version)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class RescheduleBuilder implements Builder<Reschedule, RescheduleBuilder> {
  _$Reschedule? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

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

  String? _requestedById;
  String? get requestedById => _$this._requestedById;
  set requestedById(String? requestedById) =>
      _$this._requestedById = requestedById;

  String? _decidedById;
  String? get decidedById => _$this._decidedById;
  set decidedById(String? decidedById) => _$this._decidedById = decidedById;

  RescheduleRequestReasonCodeEnum? _requestReasonCode;
  RescheduleRequestReasonCodeEnum? get requestReasonCode =>
      _$this._requestReasonCode;
  set requestReasonCode(RescheduleRequestReasonCodeEnum? requestReasonCode) =>
      _$this._requestReasonCode = requestReasonCode;

  RescheduleDecisionReasonCodeEnum? _decisionReasonCode;
  RescheduleDecisionReasonCodeEnum? get decisionReasonCode =>
      _$this._decisionReasonCode;
  set decisionReasonCode(
    RescheduleDecisionReasonCodeEnum? decisionReasonCode,
  ) => _$this._decisionReasonCode = decisionReasonCode;

  RescheduleStatusEnum? _status;
  RescheduleStatusEnum? get status => _$this._status;
  set status(RescheduleStatusEnum? status) => _$this._status = status;

  DateTime? _entitlementCutoffAt;
  DateTime? get entitlementCutoffAt => _$this._entitlementCutoffAt;
  set entitlementCutoffAt(DateTime? entitlementCutoffAt) =>
      _$this._entitlementCutoffAt = entitlementCutoffAt;

  RescheduleEntitledAtRequestEnum? _entitledAtRequest;
  RescheduleEntitledAtRequestEnum? get entitledAtRequest =>
      _$this._entitledAtRequest;
  set entitledAtRequest(RescheduleEntitledAtRequestEnum? entitledAtRequest) =>
      _$this._entitledAtRequest = entitledAtRequest;

  DateTime? _requestedAt;
  DateTime? get requestedAt => _$this._requestedAt;
  set requestedAt(DateTime? requestedAt) => _$this._requestedAt = requestedAt;

  DateTime? _decidedAt;
  DateTime? get decidedAt => _$this._decidedAt;
  set decidedAt(DateTime? decidedAt) => _$this._decidedAt = decidedAt;

  int? _version;
  int? get version => _$this._version;
  set version(int? version) => _$this._version = version;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  RescheduleBuilder() {
    Reschedule._defaults(this);
  }

  RescheduleBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _bookingId = $v.bookingId;
      _sourceClassSlotId = $v.sourceClassSlotId;
      _targetClassSlotId = $v.targetClassSlotId;
      _requestedById = $v.requestedById;
      _decidedById = $v.decidedById;
      _requestReasonCode = $v.requestReasonCode;
      _decisionReasonCode = $v.decisionReasonCode;
      _status = $v.status;
      _entitlementCutoffAt = $v.entitlementCutoffAt;
      _entitledAtRequest = $v.entitledAtRequest;
      _requestedAt = $v.requestedAt;
      _decidedAt = $v.decidedAt;
      _version = $v.version;
      _idempotentReplay = $v.idempotentReplay;
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
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'Reschedule',
            'branchId',
          ),
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
          requestedById: BuiltValueNullFieldError.checkNotNull(
            requestedById,
            r'Reschedule',
            'requestedById',
          ),
          decidedById: decidedById,
          requestReasonCode: BuiltValueNullFieldError.checkNotNull(
            requestReasonCode,
            r'Reschedule',
            'requestReasonCode',
          ),
          decisionReasonCode: decisionReasonCode,
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'Reschedule',
            'status',
          ),
          entitlementCutoffAt: BuiltValueNullFieldError.checkNotNull(
            entitlementCutoffAt,
            r'Reschedule',
            'entitlementCutoffAt',
          ),
          entitledAtRequest: BuiltValueNullFieldError.checkNotNull(
            entitledAtRequest,
            r'Reschedule',
            'entitledAtRequest',
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
          idempotentReplay: idempotentReplay,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
