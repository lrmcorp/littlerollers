// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'finalize_upload_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$FinalizeUploadCommand extends FinalizeUploadCommand {
  @override
  final String sha256;
  @override
  final int sizeBytes;

  factory _$FinalizeUploadCommand([
    void Function(FinalizeUploadCommandBuilder)? updates,
  ]) => (FinalizeUploadCommandBuilder()..update(updates))._build();

  _$FinalizeUploadCommand._({required this.sha256, required this.sizeBytes})
    : super._();
  @override
  FinalizeUploadCommand rebuild(
    void Function(FinalizeUploadCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  FinalizeUploadCommandBuilder toBuilder() =>
      FinalizeUploadCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FinalizeUploadCommand &&
        sha256 == other.sha256 &&
        sizeBytes == other.sizeBytes;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, sha256.hashCode);
    _$hash = $jc(_$hash, sizeBytes.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FinalizeUploadCommand')
          ..add('sha256', sha256)
          ..add('sizeBytes', sizeBytes))
        .toString();
  }
}

class FinalizeUploadCommandBuilder
    implements Builder<FinalizeUploadCommand, FinalizeUploadCommandBuilder> {
  _$FinalizeUploadCommand? _$v;

  String? _sha256;
  String? get sha256 => _$this._sha256;
  set sha256(String? sha256) => _$this._sha256 = sha256;

  int? _sizeBytes;
  int? get sizeBytes => _$this._sizeBytes;
  set sizeBytes(int? sizeBytes) => _$this._sizeBytes = sizeBytes;

  FinalizeUploadCommandBuilder() {
    FinalizeUploadCommand._defaults(this);
  }

  FinalizeUploadCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _sha256 = $v.sha256;
      _sizeBytes = $v.sizeBytes;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FinalizeUploadCommand other) {
    _$v = other as _$FinalizeUploadCommand;
  }

  @override
  void update(void Function(FinalizeUploadCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FinalizeUploadCommand build() => _build();

  _$FinalizeUploadCommand _build() {
    final _$result =
        _$v ??
        _$FinalizeUploadCommand._(
          sha256: BuiltValueNullFieldError.checkNotNull(
            sha256,
            r'FinalizeUploadCommand',
            'sha256',
          ),
          sizeBytes: BuiltValueNullFieldError.checkNotNull(
            sizeBytes,
            r'FinalizeUploadCommand',
            'sizeBytes',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
