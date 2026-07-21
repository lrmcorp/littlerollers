// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackageCommand extends PackageCommand {
  @override
  final String branchId;
  @override
  final String classTypeId;
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

  factory _$PackageCommand([void Function(PackageCommandBuilder)? updates]) =>
      (PackageCommandBuilder()..update(updates))._build();

  _$PackageCommand._({
    required this.branchId,
    required this.classTypeId,
    required this.businessKey,
    required this.name,
    required this.sessionCount,
    required this.durationDays,
    required this.priceRp,
    required this.effectiveFrom,
    this.effectiveUntil,
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
        branchId == other.branchId &&
        classTypeId == other.classTypeId &&
        businessKey == other.businessKey &&
        name == other.name &&
        sessionCount == other.sessionCount &&
        durationDays == other.durationDays &&
        priceRp == other.priceRp &&
        effectiveFrom == other.effectiveFrom &&
        effectiveUntil == other.effectiveUntil;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, classTypeId.hashCode);
    _$hash = $jc(_$hash, businessKey.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, sessionCount.hashCode);
    _$hash = $jc(_$hash, durationDays.hashCode);
    _$hash = $jc(_$hash, priceRp.hashCode);
    _$hash = $jc(_$hash, effectiveFrom.hashCode);
    _$hash = $jc(_$hash, effectiveUntil.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PackageCommand')
          ..add('branchId', branchId)
          ..add('classTypeId', classTypeId)
          ..add('businessKey', businessKey)
          ..add('name', name)
          ..add('sessionCount', sessionCount)
          ..add('durationDays', durationDays)
          ..add('priceRp', priceRp)
          ..add('effectiveFrom', effectiveFrom)
          ..add('effectiveUntil', effectiveUntil))
        .toString();
  }
}

class PackageCommandBuilder
    implements Builder<PackageCommand, PackageCommandBuilder> {
  _$PackageCommand? _$v;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _classTypeId;
  String? get classTypeId => _$this._classTypeId;
  set classTypeId(String? classTypeId) => _$this._classTypeId = classTypeId;

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

  PackageCommandBuilder() {
    PackageCommand._defaults(this);
  }

  PackageCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branchId = $v.branchId;
      _classTypeId = $v.classTypeId;
      _businessKey = $v.businessKey;
      _name = $v.name;
      _sessionCount = $v.sessionCount;
      _durationDays = $v.durationDays;
      _priceRp = $v.priceRp;
      _effectiveFrom = $v.effectiveFrom;
      _effectiveUntil = $v.effectiveUntil;
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
    final _$result =
        _$v ??
        _$PackageCommand._(
          branchId: BuiltValueNullFieldError.checkNotNull(
            branchId,
            r'PackageCommand',
            'branchId',
          ),
          classTypeId: BuiltValueNullFieldError.checkNotNull(
            classTypeId,
            r'PackageCommand',
            'classTypeId',
          ),
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
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
