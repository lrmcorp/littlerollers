// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'adjustment_decision_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdjustmentDecisionResult extends AdjustmentDecisionResult {
  @override
  final SessionAdjustment adjustment;
  @override
  final bool idempotentReplay;

  factory _$AdjustmentDecisionResult([
    void Function(AdjustmentDecisionResultBuilder)? updates,
  ]) => (AdjustmentDecisionResultBuilder()..update(updates))._build();

  _$AdjustmentDecisionResult._({
    required this.adjustment,
    required this.idempotentReplay,
  }) : super._();
  @override
  AdjustmentDecisionResult rebuild(
    void Function(AdjustmentDecisionResultBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AdjustmentDecisionResultBuilder toBuilder() =>
      AdjustmentDecisionResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdjustmentDecisionResult &&
        adjustment == other.adjustment &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, adjustment.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdjustmentDecisionResult')
          ..add('adjustment', adjustment)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class AdjustmentDecisionResultBuilder
    implements
        Builder<AdjustmentDecisionResult, AdjustmentDecisionResultBuilder> {
  _$AdjustmentDecisionResult? _$v;

  SessionAdjustmentBuilder? _adjustment;
  SessionAdjustmentBuilder get adjustment =>
      _$this._adjustment ??= SessionAdjustmentBuilder();
  set adjustment(SessionAdjustmentBuilder? adjustment) =>
      _$this._adjustment = adjustment;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  AdjustmentDecisionResultBuilder() {
    AdjustmentDecisionResult._defaults(this);
  }

  AdjustmentDecisionResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _adjustment = $v.adjustment.toBuilder();
      _idempotentReplay = $v.idempotentReplay;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdjustmentDecisionResult other) {
    _$v = other as _$AdjustmentDecisionResult;
  }

  @override
  void update(void Function(AdjustmentDecisionResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdjustmentDecisionResult build() => _build();

  _$AdjustmentDecisionResult _build() {
    _$AdjustmentDecisionResult _$result;
    try {
      _$result =
          _$v ??
          _$AdjustmentDecisionResult._(
            adjustment: adjustment.build(),
            idempotentReplay: BuiltValueNullFieldError.checkNotNull(
              idempotentReplay,
              r'AdjustmentDecisionResult',
              'idempotentReplay',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'adjustment';
        adjustment.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'AdjustmentDecisionResult',
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
