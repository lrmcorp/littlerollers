// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'error_envelope_error_details_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ErrorEnvelopeErrorDetailsInner extends ErrorEnvelopeErrorDetailsInner {
  @override
  final String? field;
  @override
  final String? code;
  @override
  final String? message;

  factory _$ErrorEnvelopeErrorDetailsInner([
    void Function(ErrorEnvelopeErrorDetailsInnerBuilder)? updates,
  ]) => (ErrorEnvelopeErrorDetailsInnerBuilder()..update(updates))._build();

  _$ErrorEnvelopeErrorDetailsInner._({this.field, this.code, this.message})
    : super._();
  @override
  ErrorEnvelopeErrorDetailsInner rebuild(
    void Function(ErrorEnvelopeErrorDetailsInnerBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ErrorEnvelopeErrorDetailsInnerBuilder toBuilder() =>
      ErrorEnvelopeErrorDetailsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ErrorEnvelopeErrorDetailsInner &&
        field == other.field &&
        code == other.code &&
        message == other.message;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, field.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ErrorEnvelopeErrorDetailsInner')
          ..add('field', field)
          ..add('code', code)
          ..add('message', message))
        .toString();
  }
}

class ErrorEnvelopeErrorDetailsInnerBuilder
    implements
        Builder<
          ErrorEnvelopeErrorDetailsInner,
          ErrorEnvelopeErrorDetailsInnerBuilder
        > {
  _$ErrorEnvelopeErrorDetailsInner? _$v;

  String? _field;
  String? get field => _$this._field;
  set field(String? field) => _$this._field = field;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  ErrorEnvelopeErrorDetailsInnerBuilder() {
    ErrorEnvelopeErrorDetailsInner._defaults(this);
  }

  ErrorEnvelopeErrorDetailsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _field = $v.field;
      _code = $v.code;
      _message = $v.message;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ErrorEnvelopeErrorDetailsInner other) {
    _$v = other as _$ErrorEnvelopeErrorDetailsInner;
  }

  @override
  void update(void Function(ErrorEnvelopeErrorDetailsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ErrorEnvelopeErrorDetailsInner build() => _build();

  _$ErrorEnvelopeErrorDetailsInner _build() {
    final _$result =
        _$v ??
        _$ErrorEnvelopeErrorDetailsInner._(
          field: field,
          code: code,
          message: message,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
