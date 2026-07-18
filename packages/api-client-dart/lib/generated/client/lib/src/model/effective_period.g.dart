// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'effective_period.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

abstract mixin class EffectivePeriodBuilder {
  void replace(EffectivePeriod other);
  void update(void Function(EffectivePeriodBuilder) updates);
  Date? get effectiveFrom;
  set effectiveFrom(Date? effectiveFrom);

  Date? get effectiveUntil;
  set effectiveUntil(Date? effectiveUntil);
}

class _$$EffectivePeriod extends $EffectivePeriod {
  @override
  final Date effectiveFrom;
  @override
  final Date? effectiveUntil;

  factory _$$EffectivePeriod([
    void Function($EffectivePeriodBuilder)? updates,
  ]) => ($EffectivePeriodBuilder()..update(updates))._build();

  _$$EffectivePeriod._({required this.effectiveFrom, this.effectiveUntil})
    : super._();
  @override
  $EffectivePeriod rebuild(void Function($EffectivePeriodBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  $EffectivePeriodBuilder toBuilder() =>
      $EffectivePeriodBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is $EffectivePeriod &&
        effectiveFrom == other.effectiveFrom &&
        effectiveUntil == other.effectiveUntil;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, effectiveFrom.hashCode);
    _$hash = $jc(_$hash, effectiveUntil.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'$EffectivePeriod')
          ..add('effectiveFrom', effectiveFrom)
          ..add('effectiveUntil', effectiveUntil))
        .toString();
  }
}

class $EffectivePeriodBuilder
    implements
        Builder<$EffectivePeriod, $EffectivePeriodBuilder>,
        EffectivePeriodBuilder {
  _$$EffectivePeriod? _$v;

  Date? _effectiveFrom;
  Date? get effectiveFrom => _$this._effectiveFrom;
  set effectiveFrom(covariant Date? effectiveFrom) =>
      _$this._effectiveFrom = effectiveFrom;

  Date? _effectiveUntil;
  Date? get effectiveUntil => _$this._effectiveUntil;
  set effectiveUntil(covariant Date? effectiveUntil) =>
      _$this._effectiveUntil = effectiveUntil;

  $EffectivePeriodBuilder() {
    $EffectivePeriod._defaults(this);
  }

  $EffectivePeriodBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _effectiveFrom = $v.effectiveFrom;
      _effectiveUntil = $v.effectiveUntil;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant $EffectivePeriod other) {
    _$v = other as _$$EffectivePeriod;
  }

  @override
  void update(void Function($EffectivePeriodBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  $EffectivePeriod build() => _build();

  _$$EffectivePeriod _build() {
    final _$result =
        _$v ??
        _$$EffectivePeriod._(
          effectiveFrom: BuiltValueNullFieldError.checkNotNull(
            effectiveFrom,
            r'$EffectivePeriod',
            'effectiveFrom',
          ),
          effectiveUntil: effectiveUntil,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
