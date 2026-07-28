// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_order_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreateOrderCommand extends CreateOrderCommand {
  @override
  final String packageId;
  @override
  final String? branchId;
  @override
  final String? slotId;

  factory _$CreateOrderCommand([
    void Function(CreateOrderCommandBuilder)? updates,
  ]) => (CreateOrderCommandBuilder()..update(updates))._build();

  _$CreateOrderCommand._({required this.packageId, this.branchId, this.slotId})
    : super._();
  @override
  CreateOrderCommand rebuild(
    void Function(CreateOrderCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CreateOrderCommandBuilder toBuilder() =>
      CreateOrderCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreateOrderCommand &&
        packageId == other.packageId &&
        branchId == other.branchId &&
        slotId == other.slotId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, packageId.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, slotId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CreateOrderCommand')
          ..add('packageId', packageId)
          ..add('branchId', branchId)
          ..add('slotId', slotId))
        .toString();
  }
}

class CreateOrderCommandBuilder
    implements Builder<CreateOrderCommand, CreateOrderCommandBuilder> {
  _$CreateOrderCommand? _$v;

  String? _packageId;
  String? get packageId => _$this._packageId;
  set packageId(String? packageId) => _$this._packageId = packageId;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _slotId;
  String? get slotId => _$this._slotId;
  set slotId(String? slotId) => _$this._slotId = slotId;

  CreateOrderCommandBuilder() {
    CreateOrderCommand._defaults(this);
  }

  CreateOrderCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _packageId = $v.packageId;
      _branchId = $v.branchId;
      _slotId = $v.slotId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CreateOrderCommand other) {
    _$v = other as _$CreateOrderCommand;
  }

  @override
  void update(void Function(CreateOrderCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreateOrderCommand build() => _build();

  _$CreateOrderCommand _build() {
    final _$result =
        _$v ??
        _$CreateOrderCommand._(
          packageId: BuiltValueNullFieldError.checkNotNull(
            packageId,
            r'CreateOrderCommand',
            'packageId',
          ),
          branchId: branchId,
          slotId: slotId,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
