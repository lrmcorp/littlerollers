// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackageCommand extends PackageCommand {
  @override
  final BuiltSet<String> branchIds;
  @override
  final BuiltSet<String> classTypeIds;
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
  final Date effectiveFrom;
  @override
  final Date? effectiveUntil;
  @override
  final String reason;

  factory _$PackageCommand([void Function(PackageCommandBuilder)? updates]) =>
      (PackageCommandBuilder()..update(updates))._build();

  _$PackageCommand._({
    required this.branchIds,
    required this.classTypeIds,
    required this.businessKey,
    required this.name,
    required this.sessionCount,
    required this.durationDays,
    required this.priceRp,
    required this.effectiveFrom,
    this.effectiveUntil,
    required this.reason,
  }) : super._();
  @override
  PackageCommand rebuild(void Function(PackageCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PackageCommandBuilder toBuilder() => PackageCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackageCommand &&
        branchIds == other.branchIds &&
        classTypeIds == other.classTypeIds &&
        businessKey == other.businessKey &&
        name == other.name &&
        sessionCount == other.sessionCount &&
        durationDays == other.durationDays &&
        priceRp == other.priceRp &&
        effectiveFrom == other.effectiveFrom &&
        effectiveUntil == other.effectiveUntil &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchIds.hashCode);
    _$hash = $jc(_$hash, classTypeIds.hashCode);
    _$hash = $jc(_$hash, businessKey.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, sessionCount.hashCode);
    _$hash = $jc(_$hash, durationDays.hashCode);
    _$hash = $jc(_$hash, priceRp.hashCode);
    _$hash = $jc(_$hash, effectiveFrom.hashCode);
    _$hash = $jc(_$hash, effectiveUntil.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PackageCommand')
          ..add('branchIds', branchIds)
          ..add('classTypeIds', classTypeIds)
          ..add('businessKey', businessKey)
          ..add('name', name)
          ..add('sessionCount', sessionCount)
          ..add('durationDays', durationDays)
          ..add('priceRp', priceRp)
          ..add('effectiveFrom', effectiveFrom)
          ..add('effectiveUntil', effectiveUntil)
          ..add('reason', reason))
        .toString();
  }
}

class PackageCommandBuilder
    implements Builder<PackageCommand, PackageCommandBuilder> {
  _$PackageCommand? _$v;

  SetBuilder<String>? _branchIds;
  SetBuilder<String> get branchIds =>
      _$this._branchIds ??= SetBuilder<String>();
  set branchIds(SetBuilder<String>? branchIds) => _$this._branchIds = branchIds;

  SetBuilder<String>? _classTypeIds;
  SetBuilder<String> get classTypeIds =>
      _$this._classTypeIds ??= SetBuilder<String>();
  set classTypeIds(SetBuilder<String>? classTypeIds) =>
      _$this._classTypeIds = classTypeIds;

  String? _businessKey;
  String? get businessKey => _$this._businessKey;
  set businessKey(String? businessKey) => _$this._businessKey = businessKey;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _sessionCount;
  int? get sessionCount => _$this._sessionCount;
  set sessionCount(int? sessionCount) => _$this._sessionCount = sessionCount;

  int? _durationDays;
  int? get durationDays => _$this._durationDays;
  set durationDays(int? durationDays) => _$this._durationDays = durationDays;

  int? _priceRp;
  int? get priceRp => _$this._priceRp;
  set priceRp(int? priceRp) => _$this._priceRp = priceRp;

  Date? _effectiveFrom;
  Date? get effectiveFrom => _$this._effectiveFrom;
  set effectiveFrom(Date? effectiveFrom) =>
      _$this._effectiveFrom = effectiveFrom;

  Date? _effectiveUntil;
  Date? get effectiveUntil => _$this._effectiveUntil;
  set effectiveUntil(Date? effectiveUntil) =>
      _$this._effectiveUntil = effectiveUntil;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  PackageCommandBuilder() {
    PackageCommand._defaults(this);
  }

  PackageCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchIds = $v.branchIds.toBuilder();
      _classTypeIds = $v.classTypeIds.toBuilder();
      _businessKey = $v.businessKey;
      _name = $v.name;
      _sessionCount = $v.sessionCount;
      _durationDays = $v.durationDays;
      _priceRp = $v.priceRp;
      _effectiveFrom = $v.effectiveFrom;
      _effectiveUntil = $v.effectiveUntil;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PackageCommand other) {
    _$v = other as _$PackageCommand;
  }

  @override
  void update(void Function(PackageCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackageCommand build() => _build();

  _$PackageCommand _build() {
    _$PackageCommand _$result;
    try {
      _$result =
          _$v ??
          _$PackageCommand._(
            branchIds: branchIds.build(),
            classTypeIds: classTypeIds.build(),
            businessKey: BuiltValueNullFieldError.checkNotNull(
              businessKey,
              r'PackageCommand',
              'businessKey',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'PackageCommand',
              'name',
            ),
            sessionCount: BuiltValueNullFieldError.checkNotNull(
              sessionCount,
              r'PackageCommand',
              'sessionCount',
            ),
            durationDays: BuiltValueNullFieldError.checkNotNull(
              durationDays,
              r'PackageCommand',
              'durationDays',
            ),
            priceRp: BuiltValueNullFieldError.checkNotNull(
              priceRp,
              r'PackageCommand',
              'priceRp',
            ),
            effectiveFrom: BuiltValueNullFieldError.checkNotNull(
              effectiveFrom,
              r'PackageCommand',
              'effectiveFrom',
            ),
            effectiveUntil: effectiveUntil,
            reason: BuiltValueNullFieldError.checkNotNull(
              reason,
              r'PackageCommand',
              'reason',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branchIds';
        branchIds.build();
        _$failedField = 'classTypeIds';
        classTypeIds.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PackageCommand',
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
