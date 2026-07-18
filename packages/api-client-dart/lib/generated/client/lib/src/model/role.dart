//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'role.g.dart';

class Role extends EnumClass {

  @BuiltValueEnumConst(wireName: r'CUSTOMER')
  static const Role CUSTOMER = _$CUSTOMER;
  @BuiltValueEnumConst(wireName: r'INSTRUCTOR')
  static const Role INSTRUCTOR = _$INSTRUCTOR;
  @BuiltValueEnumConst(wireName: r'ADMIN')
  static const Role ADMIN = _$ADMIN;
  @BuiltValueEnumConst(wireName: r'MANAGER')
  static const Role MANAGER = _$MANAGER;
  @BuiltValueEnumConst(wireName: r'OWNER')
  static const Role OWNER = _$OWNER;
  @BuiltValueEnumConst(wireName: r'SUPER_OWNER')
  static const Role SUPER_OWNER = _$SUPER_OWNER;
  @BuiltValueEnumConst(wireName: r'FINANCE')
  static const Role FINANCE = _$FINANCE;
  @BuiltValueEnumConst(wireName: r'OPS')
  static const Role OPS = _$OPS;

  static Serializer<Role> get serializer => _$roleSerializer;

  const Role._(String name): super(name);

  static BuiltSet<Role> get values => _$values;
  static Role valueOf(String name) => _$valueOf(name);
}

/// Optionally, enum_class can generate a mixin to go with your enum for use
/// with Angular. It exposes your enum constants as getters. So, if you mix it
/// in to your Dart component class, the values become available to the
/// corresponding Angular template.
///
/// Trigger mixin generation by writing a line like this one next to your enum.
abstract class RoleMixin = Object with _$RoleMixin;

