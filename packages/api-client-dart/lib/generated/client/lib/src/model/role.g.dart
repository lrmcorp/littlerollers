// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'role.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const Role _$CUSTOMER = const Role._('CUSTOMER');
const Role _$INSTRUCTOR = const Role._('INSTRUCTOR');
const Role _$ADMIN = const Role._('ADMIN');
const Role _$MANAGER = const Role._('MANAGER');
const Role _$OWNER = const Role._('OWNER');
const Role _$SUPER_OWNER = const Role._('SUPER_OWNER');
const Role _$FINANCE = const Role._('FINANCE');
const Role _$OPS = const Role._('OPS');

Role _$valueOf(String name) {
  switch (name) {
    case 'CUSTOMER':
      return _$CUSTOMER;
    case 'INSTRUCTOR':
      return _$INSTRUCTOR;
    case 'ADMIN':
      return _$ADMIN;
    case 'MANAGER':
      return _$MANAGER;
    case 'OWNER':
      return _$OWNER;
    case 'SUPER_OWNER':
      return _$SUPER_OWNER;
    case 'FINANCE':
      return _$FINANCE;
    case 'OPS':
      return _$OPS;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<Role> _$values = BuiltSet<Role>(const <Role>[
  _$CUSTOMER,
  _$INSTRUCTOR,
  _$ADMIN,
  _$MANAGER,
  _$OWNER,
  _$SUPER_OWNER,
  _$FINANCE,
  _$OPS,
]);

class _$RoleMeta {
  const _$RoleMeta();
  Role get CUSTOMER => _$CUSTOMER;
  Role get INSTRUCTOR => _$INSTRUCTOR;
  Role get ADMIN => _$ADMIN;
  Role get MANAGER => _$MANAGER;
  Role get OWNER => _$OWNER;
  Role get SUPER_OWNER => _$SUPER_OWNER;
  Role get FINANCE => _$FINANCE;
  Role get OPS => _$OPS;
  Role valueOf(String name) => _$valueOf(name);
  BuiltSet<Role> get values => _$values;
}

mixin _$RoleMixin {
  // ignore: non_constant_identifier_names
  _$RoleMeta get Role => const _$RoleMeta();
}

Serializer<Role> _$roleSerializer = _$RoleSerializer();

class _$RoleSerializer implements PrimitiveSerializer<Role> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'CUSTOMER': 'CUSTOMER',
    'INSTRUCTOR': 'INSTRUCTOR',
    'ADMIN': 'ADMIN',
    'MANAGER': 'MANAGER',
    'OWNER': 'OWNER',
    'SUPER_OWNER': 'SUPER_OWNER',
    'FINANCE': 'FINANCE',
    'OPS': 'OPS',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'CUSTOMER': 'CUSTOMER',
    'INSTRUCTOR': 'INSTRUCTOR',
    'ADMIN': 'ADMIN',
    'MANAGER': 'MANAGER',
    'OWNER': 'OWNER',
    'SUPER_OWNER': 'SUPER_OWNER',
    'FINANCE': 'FINANCE',
    'OPS': 'OPS',
  };

  @override
  final Iterable<Type> types = const <Type>[Role];
  @override
  final String wireName = 'Role';

  @override
  Object serialize(
    Serializers serializers,
    Role object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  Role deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => Role.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
