// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'legacy_financial_entry.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const LegacyFinancialEntryTypeEnum _$legacyFinancialEntryTypeEnum_INCOME =
    const LegacyFinancialEntryTypeEnum._('INCOME');
const LegacyFinancialEntryTypeEnum _$legacyFinancialEntryTypeEnum_EXPENSE =
    const LegacyFinancialEntryTypeEnum._('EXPENSE');

LegacyFinancialEntryTypeEnum _$legacyFinancialEntryTypeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'INCOME':
      return _$legacyFinancialEntryTypeEnum_INCOME;
    case 'EXPENSE':
      return _$legacyFinancialEntryTypeEnum_EXPENSE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<LegacyFinancialEntryTypeEnum>
_$legacyFinancialEntryTypeEnumValues = BuiltSet<LegacyFinancialEntryTypeEnum>(
  const <LegacyFinancialEntryTypeEnum>[
    _$legacyFinancialEntryTypeEnum_INCOME,
    _$legacyFinancialEntryTypeEnum_EXPENSE,
  ],
);

Serializer<LegacyFinancialEntryTypeEnum>
_$legacyFinancialEntryTypeEnumSerializer =
    _$LegacyFinancialEntryTypeEnumSerializer();

class _$LegacyFinancialEntryTypeEnumSerializer
    implements PrimitiveSerializer<LegacyFinancialEntryTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'INCOME': 'INCOME',
    'EXPENSE': 'EXPENSE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'INCOME': 'INCOME',
    'EXPENSE': 'EXPENSE',
  };

  @override
  final Iterable<Type> types = const <Type>[LegacyFinancialEntryTypeEnum];
  @override
  final String wireName = 'LegacyFinancialEntryTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    LegacyFinancialEntryTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  LegacyFinancialEntryTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => LegacyFinancialEntryTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$LegacyFinancialEntry extends LegacyFinancialEntry {
  @override
  final String id;
  @override
  final String? branchId;
  @override
  final String? purchaseId;
  @override
  final String? actorUserId;
  @override
  final String? parentId;
  @override
  final LegacyFinancialEntryTypeEnum type;
  @override
  final int amountRp;
  @override
  final DateTime occurredAt;
  @override
  final String? description;
  @override
  final String sourceTypeCode;
  @override
  final bool historical;
  @override
  final UserAccessRoleAssignmentBranch? branch;
  @override
  final LegacyFinancialEntryPurchase? purchase;
  @override
  final LegacyFinancialEntryActor? actor;

  factory _$LegacyFinancialEntry([
    void Function(LegacyFinancialEntryBuilder)? updates,
  ]) => (LegacyFinancialEntryBuilder()..update(updates))._build();

  _$LegacyFinancialEntry._({
    required this.id,
    this.branchId,
    this.purchaseId,
    this.actorUserId,
    this.parentId,
    required this.type,
    required this.amountRp,
    required this.occurredAt,
    this.description,
    required this.sourceTypeCode,
    required this.historical,
    this.branch,
    this.purchase,
    this.actor,
  }) : super._();
  @override
  LegacyFinancialEntry rebuild(
    void Function(LegacyFinancialEntryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  LegacyFinancialEntryBuilder toBuilder() =>
      LegacyFinancialEntryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LegacyFinancialEntry &&
        id == other.id &&
        branchId == other.branchId &&
        purchaseId == other.purchaseId &&
        actorUserId == other.actorUserId &&
        parentId == other.parentId &&
        type == other.type &&
        amountRp == other.amountRp &&
        occurredAt == other.occurredAt &&
        description == other.description &&
        sourceTypeCode == other.sourceTypeCode &&
        historical == other.historical &&
        branch == other.branch &&
        purchase == other.purchase &&
        actor == other.actor;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, purchaseId.hashCode);
    _$hash = $jc(_$hash, actorUserId.hashCode);
    _$hash = $jc(_$hash, parentId.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, amountRp.hashCode);
    _$hash = $jc(_$hash, occurredAt.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, sourceTypeCode.hashCode);
    _$hash = $jc(_$hash, historical.hashCode);
    _$hash = $jc(_$hash, branch.hashCode);
    _$hash = $jc(_$hash, purchase.hashCode);
    _$hash = $jc(_$hash, actor.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'LegacyFinancialEntry')
          ..add('id', id)
          ..add('branchId', branchId)
          ..add('purchaseId', purchaseId)
          ..add('actorUserId', actorUserId)
          ..add('parentId', parentId)
          ..add('type', type)
          ..add('amountRp', amountRp)
          ..add('occurredAt', occurredAt)
          ..add('description', description)
          ..add('sourceTypeCode', sourceTypeCode)
          ..add('historical', historical)
          ..add('branch', branch)
          ..add('purchase', purchase)
          ..add('actor', actor))
        .toString();
  }
}

class LegacyFinancialEntryBuilder
    implements Builder<LegacyFinancialEntry, LegacyFinancialEntryBuilder> {
  _$LegacyFinancialEntry? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _purchaseId;
  String? get purchaseId => _$this._purchaseId;
  set purchaseId(String? purchaseId) => _$this._purchaseId = purchaseId;

  String? _actorUserId;
  String? get actorUserId => _$this._actorUserId;
  set actorUserId(String? actorUserId) => _$this._actorUserId = actorUserId;

  String? _parentId;
  String? get parentId => _$this._parentId;
  set parentId(String? parentId) => _$this._parentId = parentId;

  LegacyFinancialEntryTypeEnum? _type;
  LegacyFinancialEntryTypeEnum? get type => _$this._type;
  set type(LegacyFinancialEntryTypeEnum? type) => _$this._type = type;

  int? _amountRp;
  int? get amountRp => _$this._amountRp;
  set amountRp(int? amountRp) => _$this._amountRp = amountRp;

  DateTime? _occurredAt;
  DateTime? get occurredAt => _$this._occurredAt;
  set occurredAt(DateTime? occurredAt) => _$this._occurredAt = occurredAt;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  String? _sourceTypeCode;
  String? get sourceTypeCode => _$this._sourceTypeCode;
  set sourceTypeCode(String? sourceTypeCode) =>
      _$this._sourceTypeCode = sourceTypeCode;

  bool? _historical;
  bool? get historical => _$this._historical;
  set historical(bool? historical) => _$this._historical = historical;

  UserAccessRoleAssignmentBranchBuilder? _branch;
  UserAccessRoleAssignmentBranchBuilder get branch =>
      _$this._branch ??= UserAccessRoleAssignmentBranchBuilder();
  set branch(UserAccessRoleAssignmentBranchBuilder? branch) =>
      _$this._branch = branch;

  LegacyFinancialEntryPurchaseBuilder? _purchase;
  LegacyFinancialEntryPurchaseBuilder get purchase =>
      _$this._purchase ??= LegacyFinancialEntryPurchaseBuilder();
  set purchase(LegacyFinancialEntryPurchaseBuilder? purchase) =>
      _$this._purchase = purchase;

  LegacyFinancialEntryActorBuilder? _actor;
  LegacyFinancialEntryActorBuilder get actor =>
      _$this._actor ??= LegacyFinancialEntryActorBuilder();
  set actor(LegacyFinancialEntryActorBuilder? actor) => _$this._actor = actor;

  LegacyFinancialEntryBuilder() {
    LegacyFinancialEntry._defaults(this);
  }

  LegacyFinancialEntryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _branchId = $v.branchId;
      _purchaseId = $v.purchaseId;
      _actorUserId = $v.actorUserId;
      _parentId = $v.parentId;
      _type = $v.type;
      _amountRp = $v.amountRp;
      _occurredAt = $v.occurredAt;
      _description = $v.description;
      _sourceTypeCode = $v.sourceTypeCode;
      _historical = $v.historical;
      _branch = $v.branch?.toBuilder();
      _purchase = $v.purchase?.toBuilder();
      _actor = $v.actor?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LegacyFinancialEntry other) {
    _$v = other as _$LegacyFinancialEntry;
  }

  @override
  void update(void Function(LegacyFinancialEntryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  LegacyFinancialEntry build() => _build();

  _$LegacyFinancialEntry _build() {
    _$LegacyFinancialEntry _$result;
    try {
      _$result =
          _$v ??
          _$LegacyFinancialEntry._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'LegacyFinancialEntry',
              'id',
            ),
            branchId: branchId,
            purchaseId: purchaseId,
            actorUserId: actorUserId,
            parentId: parentId,
            type: BuiltValueNullFieldError.checkNotNull(
              type,
              r'LegacyFinancialEntry',
              'type',
            ),
            amountRp: BuiltValueNullFieldError.checkNotNull(
              amountRp,
              r'LegacyFinancialEntry',
              'amountRp',
            ),
            occurredAt: BuiltValueNullFieldError.checkNotNull(
              occurredAt,
              r'LegacyFinancialEntry',
              'occurredAt',
            ),
            description: description,
            sourceTypeCode: BuiltValueNullFieldError.checkNotNull(
              sourceTypeCode,
              r'LegacyFinancialEntry',
              'sourceTypeCode',
            ),
            historical: BuiltValueNullFieldError.checkNotNull(
              historical,
              r'LegacyFinancialEntry',
              'historical',
            ),
            branch: _branch?.build(),
            purchase: _purchase?.build(),
            actor: _actor?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branch';
        _branch?.build();
        _$failedField = 'purchase';
        _purchase?.build();
        _$failedField = 'actor';
        _actor?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'LegacyFinancialEntry',
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
