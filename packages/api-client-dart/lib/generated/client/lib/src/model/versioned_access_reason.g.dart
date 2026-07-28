// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'versioned_access_reason.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$VersionedAccessReason extends VersionedAccessReason {
  @override
  final int expectedVersion;
  @override
  final AccessReasonCode reasonCode;
  @override
  final String? note;

  factory _$VersionedAccessReason([
    void Function(VersionedAccessReasonBuilder)? updates,
  ]) => (VersionedAccessReasonBuilder()..update(updates))._build();

  _$VersionedAccessReason._({
    required this.expectedVersion,
    required this.reasonCode,
    this.note,
  }) : super._();
  @override
  VersionedAccessReason rebuild(
    void Function(VersionedAccessReasonBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  VersionedAccessReasonBuilder toBuilder() =>
      VersionedAccessReasonBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VersionedAccessReason &&
        expectedVersion == other.expectedVersion &&
        reasonCode == other.reasonCode &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'VersionedAccessReason')
          ..add('expectedVersion', expectedVersion)
          ..add('reasonCode', reasonCode)
          ..add('note', note))
        .toString();
  }
}

class VersionedAccessReasonBuilder
    implements
        Builder<VersionedAccessReason, VersionedAccessReasonBuilder>,
        AccessReasonBuilder {
  _$VersionedAccessReason? _$v;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(covariant int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  AccessReasonCode? _reasonCode;
  AccessReasonCode? get reasonCode => _$this._reasonCode;
  set reasonCode(covariant AccessReasonCode? reasonCode) =>
      _$this._reasonCode = reasonCode;

  String? _note;
  String? get note => _$this._note;
  set note(covariant String? note) => _$this._note = note;

  VersionedAccessReasonBuilder() {
    VersionedAccessReason._defaults(this);
  }

  VersionedAccessReasonBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _reasonCode = $v.reasonCode;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant VersionedAccessReason other) {
    _$v = other as _$VersionedAccessReason;
  }

  @override
  void update(void Function(VersionedAccessReasonBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VersionedAccessReason build() => _build();

  _$VersionedAccessReason _build() {
    final _$result =
        _$v ??
        _$VersionedAccessReason._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'VersionedAccessReason',
            'expectedVersion',
          ),
          reasonCode: BuiltValueNullFieldError.checkNotNull(
            reasonCode,
            r'VersionedAccessReason',
            'reasonCode',
          ),
          note: note,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
