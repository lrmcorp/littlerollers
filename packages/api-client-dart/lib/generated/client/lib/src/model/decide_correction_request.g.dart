// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'decide_correction_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DecideCorrectionRequest extends DecideCorrectionRequest {
  @override
  final String reason;

  factory _$DecideCorrectionRequest([
    void Function(DecideCorrectionRequestBuilder)? updates,
  ]) => (DecideCorrectionRequestBuilder()..update(updates))._build();

  _$DecideCorrectionRequest._({required this.reason}) : super._();
  @override
  DecideCorrectionRequest rebuild(
    void Function(DecideCorrectionRequestBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  DecideCorrectionRequestBuilder toBuilder() =>
      DecideCorrectionRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DecideCorrectionRequest && reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'DecideCorrectionRequest',
    )..add('reason', reason)).toString();
  }
}

class DecideCorrectionRequestBuilder
    implements
        Builder<DecideCorrectionRequest, DecideCorrectionRequestBuilder> {
  _$DecideCorrectionRequest? _$v;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  DecideCorrectionRequestBuilder() {
    DecideCorrectionRequest._defaults(this);
  }

  DecideCorrectionRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DecideCorrectionRequest other) {
    _$v = other as _$DecideCorrectionRequest;
  }

  @override
  void update(void Function(DecideCorrectionRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DecideCorrectionRequest build() => _build();

  _$DecideCorrectionRequest _build() {
    final _$result =
        _$v ??
        _$DecideCorrectionRequest._(
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'DecideCorrectionRequest',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
