// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'voucher_preview_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$VoucherPreviewCommand extends VoucherPreviewCommand {
  @override
  final String packageId;
  @override
  final String? branchId;
  @override
  final String code;

  factory _$VoucherPreviewCommand([
    void Function(VoucherPreviewCommandBuilder)? updates,
  ]) => (VoucherPreviewCommandBuilder()..update(updates))._build();

  _$VoucherPreviewCommand._({
    required this.packageId,
    this.branchId,
    required this.code,
  }) : super._();
  @override
  VoucherPreviewCommand rebuild(
    void Function(VoucherPreviewCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  VoucherPreviewCommandBuilder toBuilder() =>
      VoucherPreviewCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VoucherPreviewCommand &&
        packageId == other.packageId &&
        branchId == other.branchId &&
        code == other.code;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, packageId.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'VoucherPreviewCommand')
          ..add('packageId', packageId)
          ..add('branchId', branchId)
          ..add('code', code))
        .toString();
  }
}

class VoucherPreviewCommandBuilder
    implements Builder<VoucherPreviewCommand, VoucherPreviewCommandBuilder> {
  _$VoucherPreviewCommand? _$v;

  String? _packageId;
  String? get packageId => _$this._packageId;
  set packageId(String? packageId) => _$this._packageId = packageId;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  VoucherPreviewCommandBuilder() {
    VoucherPreviewCommand._defaults(this);
  }

  VoucherPreviewCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _packageId = $v.packageId;
      _branchId = $v.branchId;
      _code = $v.code;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VoucherPreviewCommand other) {
    _$v = other as _$VoucherPreviewCommand;
  }

  @override
  void update(void Function(VoucherPreviewCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VoucherPreviewCommand build() => _build();

  _$VoucherPreviewCommand _build() {
    final _$result =
        _$v ??
        _$VoucherPreviewCommand._(
          packageId: BuiltValueNullFieldError.checkNotNull(
            packageId,
            r'VoucherPreviewCommand',
            'packageId',
          ),
          branchId: branchId,
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'VoucherPreviewCommand',
            'code',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
