// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'access_reason.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

abstract mixin class AccessReasonBuilder {
  void replace(AccessReason other);
  void update(void Function(AccessReasonBuilder) updates);
  AccessReasonCode? get reasonCode;
  set reasonCode(AccessReasonCode? reasonCode);

  String? get note;
  set note(String? note);
}

class _$$AccessReason extends $AccessReason {
  @override
  final AccessReasonCode reasonCode;
  @override
  final String? note;

  factory _$$AccessReason([void Function($AccessReasonBuilder)? updates]) =>
      ($AccessReasonBuilder()..update(updates))._build();

  _$$AccessReason._({required this.reasonCode, this.note}) : super._();
  @override
  $AccessReason rebuild(void Function($AccessReasonBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  $AccessReasonBuilder toBuilder() => $AccessReasonBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is $AccessReason &&
        reasonCode == other.reasonCode &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'$AccessReason')
          ..add('reasonCode', reasonCode)
          ..add('note', note))
        .toString();
  }
}

class $AccessReasonBuilder
    implements
        Builder<$AccessReason, $AccessReasonBuilder>,
        AccessReasonBuilder {
  _$$AccessReason? _$v;

  AccessReasonCode? _reasonCode;
  AccessReasonCode? get reasonCode => _$this._reasonCode;
  set reasonCode(covariant AccessReasonCode? reasonCode) =>
      _$this._reasonCode = reasonCode;

  String? _note;
  String? get note => _$this._note;
  set note(covariant String? note) => _$this._note = note;

  $AccessReasonBuilder() {
    $AccessReason._defaults(this);
  }

  $AccessReasonBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reasonCode = $v.reasonCode;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant $AccessReason other) {
    _$v = other as _$$AccessReason;
  }

  @override
  void update(void Function($AccessReasonBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  $AccessReason build() => _build();

  _$$AccessReason _build() {
    final _$result =
        _$v ??
        _$$AccessReason._(
          reasonCode: BuiltValueNullFieldError.checkNotNull(
            reasonCode,
            r'$AccessReason',
            'reasonCode',
          ),
          note: note,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
