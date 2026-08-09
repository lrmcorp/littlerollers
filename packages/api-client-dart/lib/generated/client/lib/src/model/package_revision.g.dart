// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_revision.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackageRevision extends PackageRevision {
  @override
  final String id;
  @override
  final int revisionNumber;
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

  factory _$PackageRevision([void Function(PackageRevisionBuilder)? updates]) =>
      (PackageRevisionBuilder()..update(updates))._build();

  _$PackageRevision._({
    required this.id,
    required this.revisionNumber,
    required this.sessionCount,
    required this.durationDays,
    required this.priceRp,
    required this.effectiveFrom,
    this.effectiveUntil,
  }) : super._();
  @override
  PackageRevision rebuild(void Function(PackageRevisionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PackageRevisionBuilder toBuilder() => PackageRevisionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackageRevision &&
        id == other.id &&
        revisionNumber == other.revisionNumber &&
        sessionCount == other.sessionCount &&
        durationDays == other.durationDays &&
        priceRp == other.priceRp &&
        effectiveFrom == other.effectiveFrom &&
        effectiveUntil == other.effectiveUntil;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, revisionNumber.hashCode);
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
    return (newBuiltValueToStringHelper(r'PackageRevision')
          ..add('id', id)
          ..add('revisionNumber', revisionNumber)
          ..add('sessionCount', sessionCount)
          ..add('durationDays', durationDays)
          ..add('priceRp', priceRp)
          ..add('effectiveFrom', effectiveFrom)
          ..add('effectiveUntil', effectiveUntil))
        .toString();
  }
}

class PackageRevisionBuilder
    implements Builder<PackageRevision, PackageRevisionBuilder> {
  _$PackageRevision? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  int? _revisionNumber;
  int? get revisionNumber => _$this._revisionNumber;
  set revisionNumber(int? revisionNumber) =>
      _$this._revisionNumber = revisionNumber;

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

  PackageRevisionBuilder() {
    PackageRevision._defaults(this);
  }

  PackageRevisionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _revisionNumber = $v.revisionNumber;
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
  void replace(PackageRevision other) {
    _$v = other as _$PackageRevision;
  }

  @override
  void update(void Function(PackageRevisionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackageRevision build() => _build();

  _$PackageRevision _build() {
    final _$result =
        _$v ??
        _$PackageRevision._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PackageRevision',
            'id',
          ),
          revisionNumber: BuiltValueNullFieldError.checkNotNull(
            revisionNumber,
            r'PackageRevision',
            'revisionNumber',
          ),
          sessionCount: BuiltValueNullFieldError.checkNotNull(
            sessionCount,
            r'PackageRevision',
            'sessionCount',
          ),
          durationDays: BuiltValueNullFieldError.checkNotNull(
            durationDays,
            r'PackageRevision',
            'durationDays',
          ),
          priceRp: BuiltValueNullFieldError.checkNotNull(
            priceRp,
            r'PackageRevision',
            'priceRp',
          ),
          effectiveFrom: BuiltValueNullFieldError.checkNotNull(
            effectiveFrom,
            r'PackageRevision',
            'effectiveFrom',
          ),
          effectiveUntil: effectiveUntil,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
