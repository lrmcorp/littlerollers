// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'access_role_scope.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const AccessRoleScope _$GLOBAL = const AccessRoleScope._('GLOBAL');
const AccessRoleScope _$BRANCH = const AccessRoleScope._('BRANCH');

AccessRoleScope _$valueOf(String name) {
  switch (name) {
    case 'GLOBAL':
      return _$GLOBAL;
    case 'BRANCH':
      return _$BRANCH;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AccessRoleScope> _$values = BuiltSet<AccessRoleScope>(
  const <AccessRoleScope>[_$GLOBAL, _$BRANCH],
);

class _$AccessRoleScopeMeta {
  const _$AccessRoleScopeMeta();
  AccessRoleScope get GLOBAL => _$GLOBAL;
  AccessRoleScope get BRANCH => _$BRANCH;
  AccessRoleScope valueOf(String name) => _$valueOf(name);
  BuiltSet<AccessRoleScope> get values => _$values;
}

mixin _$AccessRoleScopeMixin {
  // ignore: non_constant_identifier_names
  _$AccessRoleScopeMeta get AccessRoleScope => const _$AccessRoleScopeMeta();
}

Serializer<AccessRoleScope> _$accessRoleScopeSerializer =
    _$AccessRoleScopeSerializer();

class _$AccessRoleScopeSerializer
    implements PrimitiveSerializer<AccessRoleScope> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'GLOBAL': 'GLOBAL',
    'BRANCH': 'BRANCH',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'GLOBAL': 'GLOBAL',
    'BRANCH': 'BRANCH',
  };

  @override
  final Iterable<Type> types = const <Type>[AccessRoleScope];
  @override
  final String wireName = 'AccessRoleScope';

  @override
  Object serialize(
    Serializers serializers,
    AccessRoleScope object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  AccessRoleScope deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => AccessRoleScope.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
