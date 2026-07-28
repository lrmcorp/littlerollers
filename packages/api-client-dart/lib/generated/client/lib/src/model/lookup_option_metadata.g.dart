// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'lookup_option_metadata.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$LookupOptionMetadata extends LookupOptionMetadata {
  @override
  final BuiltList<Role> roles;
  @override
  final BuiltList<String> branchIds;

  factory _$LookupOptionMetadata([
    void Function(LookupOptionMetadataBuilder)? updates,
  ]) => (LookupOptionMetadataBuilder()..update(updates))._build();

  _$LookupOptionMetadata._({required this.roles, required this.branchIds})
    : super._();
  @override
  LookupOptionMetadata rebuild(
    void Function(LookupOptionMetadataBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  LookupOptionMetadataBuilder toBuilder() =>
      LookupOptionMetadataBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LookupOptionMetadata &&
        roles == other.roles &&
        branchIds == other.branchIds;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, roles.hashCode);
    _$hash = $jc(_$hash, branchIds.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'LookupOptionMetadata')
          ..add('roles', roles)
          ..add('branchIds', branchIds))
        .toString();
  }
}

class LookupOptionMetadataBuilder
    implements Builder<LookupOptionMetadata, LookupOptionMetadataBuilder> {
  _$LookupOptionMetadata? _$v;

  ListBuilder<Role>? _roles;
  ListBuilder<Role> get roles => _$this._roles ??= ListBuilder<Role>();
  set roles(ListBuilder<Role>? roles) => _$this._roles = roles;

  ListBuilder<String>? _branchIds;
  ListBuilder<String> get branchIds =>
      _$this._branchIds ??= ListBuilder<String>();
  set branchIds(ListBuilder<String>? branchIds) =>
      _$this._branchIds = branchIds;

  LookupOptionMetadataBuilder() {
    LookupOptionMetadata._defaults(this);
  }

  LookupOptionMetadataBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _roles = $v.roles.toBuilder();
      _branchIds = $v.branchIds.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LookupOptionMetadata other) {
    _$v = other as _$LookupOptionMetadata;
  }

  @override
  void update(void Function(LookupOptionMetadataBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  LookupOptionMetadata build() => _build();

  _$LookupOptionMetadata _build() {
    _$LookupOptionMetadata _$result;
    try {
      _$result =
          _$v ??
          _$LookupOptionMetadata._(
            roles: roles.build(),
            branchIds: branchIds.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'roles';
        roles.build();
        _$failedField = 'branchIds';
        branchIds.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'LookupOptionMetadata',
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
