// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'error_envelope_error.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ErrorEnvelopeError extends ErrorEnvelopeError {
  @override
  final String code;
  @override
  final String message;
  @override
  final String correlationId;
  @override
  final BuiltList<ErrorEnvelopeErrorDetailsInner> details;
  @override
  final bool? retryable;

  factory _$ErrorEnvelopeError([
    void Function(ErrorEnvelopeErrorBuilder)? updates,
  ]) => (ErrorEnvelopeErrorBuilder()..update(updates))._build();

  _$ErrorEnvelopeError._({
    required this.code,
    required this.message,
    required this.correlationId,
    required this.details,
    this.retryable,
  }) : super._();
  @override
  ErrorEnvelopeError rebuild(
    void Function(ErrorEnvelopeErrorBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ErrorEnvelopeErrorBuilder toBuilder() =>
      ErrorEnvelopeErrorBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ErrorEnvelopeError &&
        code == other.code &&
        message == other.message &&
        correlationId == other.correlationId &&
        details == other.details &&
        retryable == other.retryable;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jc(_$hash, correlationId.hashCode);
    _$hash = $jc(_$hash, details.hashCode);
    _$hash = $jc(_$hash, retryable.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ErrorEnvelopeError')
          ..add('code', code)
          ..add('message', message)
          ..add('correlationId', correlationId)
          ..add('details', details)
          ..add('retryable', retryable))
        .toString();
  }
}

class ErrorEnvelopeErrorBuilder
    implements Builder<ErrorEnvelopeError, ErrorEnvelopeErrorBuilder> {
  _$ErrorEnvelopeError? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  String? _correlationId;
  String? get correlationId => _$this._correlationId;
  set correlationId(String? correlationId) =>
      _$this._correlationId = correlationId;

  ListBuilder<ErrorEnvelopeErrorDetailsInner>? _details;
  ListBuilder<ErrorEnvelopeErrorDetailsInner> get details =>
      _$this._details ??= ListBuilder<ErrorEnvelopeErrorDetailsInner>();
  set details(ListBuilder<ErrorEnvelopeErrorDetailsInner>? details) =>
      _$this._details = details;

  bool? _retryable;
  bool? get retryable => _$this._retryable;
  set retryable(bool? retryable) => _$this._retryable = retryable;

  ErrorEnvelopeErrorBuilder() {
    ErrorEnvelopeError._defaults(this);
  }

  ErrorEnvelopeErrorBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _code = $v.code;
      _message = $v.message;
      _correlationId = $v.correlationId;
      _details = $v.details.toBuilder();
      _retryable = $v.retryable;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ErrorEnvelopeError other) {
    _$v = other as _$ErrorEnvelopeError;
  }

  @override
  void update(void Function(ErrorEnvelopeErrorBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ErrorEnvelopeError build() => _build();

  _$ErrorEnvelopeError _build() {
    _$ErrorEnvelopeError _$result;
    try {
      _$result =
          _$v ??
          _$ErrorEnvelopeError._(
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'ErrorEnvelopeError',
              'code',
            ),
            message: BuiltValueNullFieldError.checkNotNull(
              message,
              r'ErrorEnvelopeError',
              'message',
            ),
            correlationId: BuiltValueNullFieldError.checkNotNull(
              correlationId,
              r'ErrorEnvelopeError',
              'correlationId',
            ),
            details: details.build(),
            retryable: retryable,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'details';
        details.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'ErrorEnvelopeError',
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
