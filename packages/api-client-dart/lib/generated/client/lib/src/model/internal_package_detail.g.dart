// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'internal_package_detail.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const InternalPackageDetailStatusEnum _$internalPackageDetailStatusEnum_ACTIVE =
    const InternalPackageDetailStatusEnum._('ACTIVE');
const InternalPackageDetailStatusEnum
_$internalPackageDetailStatusEnum_INACTIVE =
    const InternalPackageDetailStatusEnum._('INACTIVE');

InternalPackageDetailStatusEnum _$internalPackageDetailStatusEnumValueOf(
  String name,
) {
  switch (name) {
    case 'ACTIVE':
      return _$internalPackageDetailStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$internalPackageDetailStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<InternalPackageDetailStatusEnum>
_$internalPackageDetailStatusEnumValues =
    BuiltSet<InternalPackageDetailStatusEnum>(
      const <InternalPackageDetailStatusEnum>[
        _$internalPackageDetailStatusEnum_ACTIVE,
        _$internalPackageDetailStatusEnum_INACTIVE,
      ],
    );

const InternalPackageDetailEffectiveStateEnum
_$internalPackageDetailEffectiveStateEnum_ACTIVE =
    const InternalPackageDetailEffectiveStateEnum._('ACTIVE');
const InternalPackageDetailEffectiveStateEnum
_$internalPackageDetailEffectiveStateEnum_SCHEDULED =
    const InternalPackageDetailEffectiveStateEnum._('SCHEDULED');
const InternalPackageDetailEffectiveStateEnum
_$internalPackageDetailEffectiveStateEnum_EXPIRED =
    const InternalPackageDetailEffectiveStateEnum._('EXPIRED');
const InternalPackageDetailEffectiveStateEnum
_$internalPackageDetailEffectiveStateEnum_INACTIVE =
    const InternalPackageDetailEffectiveStateEnum._('INACTIVE');

InternalPackageDetailEffectiveStateEnum
_$internalPackageDetailEffectiveStateEnumValueOf(String name) {
  switch (name) {
    case 'ACTIVE':
      return _$internalPackageDetailEffectiveStateEnum_ACTIVE;
    case 'SCHEDULED':
      return _$internalPackageDetailEffectiveStateEnum_SCHEDULED;
    case 'EXPIRED':
      return _$internalPackageDetailEffectiveStateEnum_EXPIRED;
    case 'INACTIVE':
      return _$internalPackageDetailEffectiveStateEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<InternalPackageDetailEffectiveStateEnum>
_$internalPackageDetailEffectiveStateEnumValues =
    BuiltSet<InternalPackageDetailEffectiveStateEnum>(
      const <InternalPackageDetailEffectiveStateEnum>[
        _$internalPackageDetailEffectiveStateEnum_ACTIVE,
        _$internalPackageDetailEffectiveStateEnum_SCHEDULED,
        _$internalPackageDetailEffectiveStateEnum_EXPIRED,
        _$internalPackageDetailEffectiveStateEnum_INACTIVE,
      ],
    );

Serializer<InternalPackageDetailStatusEnum>
_$internalPackageDetailStatusEnumSerializer =
    _$InternalPackageDetailStatusEnumSerializer();
Serializer<InternalPackageDetailEffectiveStateEnum>
_$internalPackageDetailEffectiveStateEnumSerializer =
    _$InternalPackageDetailEffectiveStateEnumSerializer();

class _$InternalPackageDetailStatusEnumSerializer
    implements PrimitiveSerializer<InternalPackageDetailStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[InternalPackageDetailStatusEnum];
  @override
  final String wireName = 'InternalPackageDetailStatusEnum';

  @override
  Object serialize(
    Serializers serializers,
    InternalPackageDetailStatusEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  InternalPackageDetailStatusEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => InternalPackageDetailStatusEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$InternalPackageDetailEffectiveStateEnumSerializer
    implements PrimitiveSerializer<InternalPackageDetailEffectiveStateEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'SCHEDULED': 'SCHEDULED',
    'EXPIRED': 'EXPIRED',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'SCHEDULED': 'SCHEDULED',
    'EXPIRED': 'EXPIRED',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    InternalPackageDetailEffectiveStateEnum,
  ];
  @override
  final String wireName = 'InternalPackageDetailEffectiveStateEnum';

  @override
  Object serialize(
    Serializers serializers,
    InternalPackageDetailEffectiveStateEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  InternalPackageDetailEffectiveStateEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => InternalPackageDetailEffectiveStateEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$InternalPackageDetail extends InternalPackageDetail {
  @override
  final BuiltList<PackagePromotion> promotions;
  @override
  final BuiltList<SafeAuditActivity> auditActivity;
  @override
  final String id;
  @override
  final String branchId;
  @override
  final String classTypeId;
  @override
  final BuiltList<PackageBranchScope>? branchScopes;
  @override
  final BuiltList<PackageClassTypeScope>? classTypeScopes;
  @override
  final BuiltList<PackageRevision>? revisions;
  @override
  final String businessKey;
  @override
  final String name;
  @override
  final int sessionCount;
  @override
  final int durationDays;
  @override
  final int priceRp;
  @override
  final PackageStatusEnum status;
  @override
  final PackageEffectiveStateEnum? effectiveState;
  @override
  final bool? livePromotion;
  @override
  final Date effectiveFrom;
  @override
  final Date? effectiveUntil;
  @override
  final int version;

  factory _$InternalPackageDetail([
    void Function(InternalPackageDetailBuilder)? updates,
  ]) => (InternalPackageDetailBuilder()..update(updates))._build();

  _$InternalPackageDetail._({
    required this.promotions,
    required this.auditActivity,
    required this.id,
    required this.branchId,
    required this.classTypeId,
    this.branchScopes,
    this.classTypeScopes,
    this.revisions,
    required this.businessKey,
    required this.name,
    required this.sessionCount,
    required this.durationDays,
    required this.priceRp,
    required this.status,
    this.effectiveState,
    this.livePromotion,
    required this.effectiveFrom,
    this.effectiveUntil,
    required this.version,
  }) : super._();
  @override
  InternalPackageDetail rebuild(
    void Function(InternalPackageDetailBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  InternalPackageDetailBuilder toBuilder() =>
      InternalPackageDetailBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is InternalPackageDetail &&
        promotions == other.promotions &&
        auditActivity == other.auditActivity &&
        id == other.id &&
        branchId == other.branchId &&
        classTypeId == other.classTypeId &&
        branchScopes == other.branchScopes &&
        classTypeScopes == other.classTypeScopes &&
        revisions == other.revisions &&
        businessKey == other.businessKey &&
        name == other.name &&
        sessionCount == other.sessionCount &&
        durationDays == other.durationDays &&
        priceRp == other.priceRp &&
        status == other.status &&
        effectiveState == other.effectiveState &&
        livePromotion == other.livePromotion &&
        effectiveFrom == other.effectiveFrom &&
        effectiveUntil == other.effectiveUntil &&
        version == other.version;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, promotions.hashCode);
    _$hash = $jc(_$hash, auditActivity.hashCode);
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, branchScopes.hashCode);
    _$hash = $jc(_$hash, classTypeScopes.hashCode);
    _$hash = $jc(_$hash, revisions.hashCode);
    _$hash = $jc(_$hash, businessKey.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, sessionCount.hashCode);
    _$hash = $jc(_$hash, durationDays.hashCode);
    _$hash = $jc(_$hash, priceRp.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, effectiveState.hashCode);
    _$hash = $jc(_$hash, livePromotion.hashCode);
    _$hash = $jc(_$hash, effectiveFrom.hashCode);
    _$hash = $jc(_$hash, effectiveUntil.hashCode);
    _$hash = $jc(_$hash, version.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'InternalPackageDetail')
          ..add('promotions', promotions)
          ..add('auditActivity', auditActivity)
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('classTypeId', classTypeId)
          ..add('branchScopes', branchScopes)
          ..add('classTypeScopes', classTypeScopes)
          ..add('revisions', revisions)
          ..add('businessKey', businessKey)
          ..add('name', name)
          ..add('sessionCount', sessionCount)
          ..add('durationDays', durationDays)
          ..add('priceRp', priceRp)
          ..add('status', status)
          ..add('effectiveState', effectiveState)
          ..add('livePromotion', livePromotion)
          ..add('effectiveFrom', effectiveFrom)
          ..add('effectiveUntil', effectiveUntil)
          ..add('version', version))
        .toString();
  }
}

class InternalPackageDetailBuilder
    implements
        Builder<InternalPackageDetail, InternalPackageDetailBuilder>,
        PackageBuilder {
  _$InternalPackageDetail? _$v;

  ListBuilder<PackagePromotion>? _promotions;
  ListBuilder<PackagePromotion> get promotions =>
      _$this._promotions ??= ListBuilder<PackagePromotion>();
  set promotions(covariant ListBuilder<PackagePromotion>? promotions) =>
      _$this._promotions = promotions;

  ListBuilder<SafeAuditActivity>? _auditActivity;
  ListBuilder<SafeAuditActivity> get auditActivity =>
      _$this._auditActivity ??= ListBuilder<SafeAuditActivity>();
  set auditActivity(covariant ListBuilder<SafeAuditActivity>? auditActivity) =>
      _$this._auditActivity = auditActivity;

  String? _id;
  String? get id => _$this._id;
  set id(covariant String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(covariant String? branchId) => _$this._branchId = branchId;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(covariant String? classTypeId) =>
      _$this._classTypeId = classTypeId;

  ListBuilder<PackageBranchScope>? _branchScopes;
  ListBuilder<PackageBranchScope> get branchScopes =>
      _$this._branchScopes ??= ListBuilder<PackageBranchScope>();
  set branchScopes(covariant ListBuilder<PackageBranchScope>? branchScopes) =>
      _$this._branchScopes = branchScopes;

  ListBuilder<PackageClassTypeScope>? _classTypeScopes;
  ListBuilder<PackageClassTypeScope> get classTypeScopes =>
      _$this._classTypeScopes ??= ListBuilder<PackageClassTypeScope>();
  set classTypeScopes(
    covariant ListBuilder<PackageClassTypeScope>? classTypeScopes,
  ) => _$this._classTypeScopes = classTypeScopes;

  ListBuilder<PackageRevision>? _revisions;
  ListBuilder<PackageRevision> get revisions =>
      _$this._revisions ??= ListBuilder<PackageRevision>();
  set revisions(covariant ListBuilder<PackageRevision>? revisions) =>
      _$this._revisions = revisions;

  String? _businessKey;
  String? get businessKey => _$this._businessKey;
  set businessKey(covariant String? businessKey) =>
      _$this._businessKey = businessKey;

  String? _name;
  String? get name => _$this._name;
  set name(covariant String? name) => _$this._name = name;

  int? _sessionCount;
  int? get sessionCount => _$this._sessionCount;
  set sessionCount(covariant int? sessionCount) =>
      _$this._sessionCount = sessionCount;

  int? _durationDays;
  int? get durationDays => _$this._durationDays;
  set durationDays(covariant int? durationDays) =>
      _$this._durationDays = durationDays;

  int? _priceRp;
  int? get priceRp => _$this._priceRp;
  set priceRp(covariant int? priceRp) => _$this._priceRp = priceRp;

  PackageStatusEnum? _status;
  PackageStatusEnum? get status => _$this._status;
  set status(covariant PackageStatusEnum? status) => _$this._status = status;

  PackageEffectiveStateEnum? _effectiveState;
  PackageEffectiveStateEnum? get effectiveState => _$this._effectiveState;
  set effectiveState(covariant PackageEffectiveStateEnum? effectiveState) =>
      _$this._effectiveState = effectiveState;

  bool? _livePromotion;
  bool? get livePromotion => _$this._livePromotion;
  set livePromotion(covariant bool? livePromotion) =>
      _$this._livePromotion = livePromotion;

  Date? _effectiveFrom;
  Date? get effectiveFrom => _$this._effectiveFrom;
  set effectiveFrom(covariant Date? effectiveFrom) =>
      _$this._effectiveFrom = effectiveFrom;

  Date? _effectiveUntil;
  Date? get effectiveUntil => _$this._effectiveUntil;
  set effectiveUntil(covariant Date? effectiveUntil) =>
      _$this._effectiveUntil = effectiveUntil;

  int? _version;
  int? get version => _$this._version;
  set version(covariant int? version) => _$this._version = version;

  InternalPackageDetailBuilder() {
    InternalPackageDetail._defaults(this);
  }

  InternalPackageDetailBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _promotions = $v.promotions.toBuilder();
      _auditActivity = $v.auditActivity.toBuilder();
      _id = $v.id;
      _branchId = $v.branchId;
      _classTypeId = $v.classTypeId;
      _branchScopes = $v.branchScopes?.toBuilder();
      _classTypeScopes = $v.classTypeScopes?.toBuilder();
      _revisions = $v.revisions?.toBuilder();
      _businessKey = $v.businessKey;
      _name = $v.name;
      _sessionCount = $v.sessionCount;
      _durationDays = $v.durationDays;
      _priceRp = $v.priceRp;
      _status = $v.status;
      _effectiveState = $v.effectiveState;
      _livePromotion = $v.livePromotion;
      _effectiveFrom = $v.effectiveFrom;
      _effectiveUntil = $v.effectiveUntil;
      _version = $v.version;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant InternalPackageDetail other) {
    _$v = other as _$InternalPackageDetail;
  }

  @override
  void update(void Function(InternalPackageDetailBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  InternalPackageDetail build() => _build();

  _$InternalPackageDetail _build() {
    _$InternalPackageDetail _$result;
    try {
      _$result =
          _$v ??
          _$InternalPackageDetail._(
            promotions: promotions.build(),
            auditActivity: auditActivity.build(),
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'InternalPackageDetail',
              'id',
            ),
            branchId: BuiltValueNullFieldError.checkNotNull(
              branchId,
              r'InternalPackageDetail',
              'branchId',
            ),
            classTypeId: BuiltValueNullFieldError.checkNotNull(
              classTypeId,
              r'InternalPackageDetail',
              'classTypeId',
            ),
            branchScopes: _branchScopes?.build(),
            classTypeScopes: _classTypeScopes?.build(),
            revisions: _revisions?.build(),
            businessKey: BuiltValueNullFieldError.checkNotNull(
              businessKey,
              r'InternalPackageDetail',
              'businessKey',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'InternalPackageDetail',
              'name',
            ),
            sessionCount: BuiltValueNullFieldError.checkNotNull(
              sessionCount,
              r'InternalPackageDetail',
              'sessionCount',
            ),
            durationDays: BuiltValueNullFieldError.checkNotNull(
              durationDays,
              r'InternalPackageDetail',
              'durationDays',
            ),
            priceRp: BuiltValueNullFieldError.checkNotNull(
              priceRp,
              r'InternalPackageDetail',
              'priceRp',
            ),
            status: BuiltValueNullFieldError.checkNotNull(
              status,
              r'InternalPackageDetail',
              'status',
            ),
            effectiveState: effectiveState,
            livePromotion: livePromotion,
            effectiveFrom: BuiltValueNullFieldError.checkNotNull(
              effectiveFrom,
              r'InternalPackageDetail',
              'effectiveFrom',
            ),
            effectiveUntil: effectiveUntil,
            version: BuiltValueNullFieldError.checkNotNull(
              version,
              r'InternalPackageDetail',
              'version',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'promotions';
        promotions.build();
        _$failedField = 'auditActivity';
        auditActivity.build();

        _$failedField = 'branchScopes';
        _branchScopes?.build();
        _$failedField = 'classTypeScopes';
        _classTypeScopes?.build();
        _$failedField = 'revisions';
        _revisions?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'InternalPackageDetail',
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
