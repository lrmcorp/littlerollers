// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_update_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackageUpdateCommand extends PackageUpdateCommand {
  @override
  final String? name;
  @override
  final int? sessionCount;
  @override
  final int? durationDays;
  @override
  final int? priceRp;
  @override
  final Date? effectiveFrom;
  @override
  final Date? effectiveUntil;
  @override
  final int expectedVersion;
  @override
  final String reason;

  factory _$PackageUpdateCommand([
    void Function(PackageUpdateCommandBuilder)? updates,
  ]) => (PackageUpdateCommandBuilder()..update(updates))._build();

  _$PackageUpdateCommand._({
    this.name,
    this.sessionCount,
    this.durationDays,
    this.priceRp,
    this.effectiveFrom,
    this.effectiveUntil,
    required this.expectedVersion,
    required this.reason,
  }) : super._();
  @override
  PackageUpdateCommand rebuild(
    void Function(PackageUpdateCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PackageUpdateCommandBuilder toBuilder() =>
      PackageUpdateCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackageUpdateCommand &&
        name == other.name &&
        sessionCount == other.sessionCount &&
        durationDays == other.durationDays &&
        priceRp == other.priceRp &&
        effectiveFrom == other.effectiveFrom &&
        effectiveUntil == other.effectiveUntil &&
        expectedVersion == other.expectedVersion &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, sessionCount.hashCode);
    _$hash = $jc(_$hash, durationDays.hashCode);
    _$hash = $jc(_$hash, priceRp.hashCode);
    _$hash = $jc(_$hash, effectiveFrom.hashCode);
    _$hash = $jc(_$hash, effectiveUntil.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PackageUpdateCommand')
          ..add('name', name)
          ..add('sessionCount', sessionCount)
          ..add('durationDays', durationDays)
          ..add('priceRp', priceRp)
          ..add('effectiveFrom', effectiveFrom)
          ..add('effectiveUntil', effectiveUntil)
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class PackageUpdateCommandBuilder
    implements Builder<PackageUpdateCommand, PackageUpdateCommandBuilder> {
  _$PackageUpdateCommand? _$v;

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

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  PackageUpdateCommandBuilder() {
    PackageUpdateCommand._defaults(this);
  }

  PackageUpdateCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _sessionCount = $v.sessionCount;
      _durationDays = $v.durationDays;
      _priceRp = $v.priceRp;
      _effectiveFrom = $v.effectiveFrom;
      _effectiveUntil = $v.effectiveUntil;
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PackageUpdateCommand other) {
    _$v = other as _$PackageUpdateCommand;
  }

  @override
  void update(void Function(PackageUpdateCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackageUpdateCommand build() => _build();

  _$PackageUpdateCommand _build() {
    final _$result =
        _$v ??
        _$PackageUpdateCommand._(
          name: name,
          sessionCount: sessionCount,
          durationDays: durationDays,
          priceRp: priceRp,
          effectiveFrom: effectiveFrom,
          effectiveUntil: effectiveUntil,
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'PackageUpdateCommand',
            'expectedVersion',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'PackageUpdateCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
