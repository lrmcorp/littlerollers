//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/package_branch_scope_branch.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_branch_scope.g.dart';

/// PackageBranchScope
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [active] 
/// * [branch] 
@BuiltValue()
abstract class PackageBranchScope implements Built<PackageBranchScope, PackageBranchScopeBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'active')
  bool get active;

  @BuiltValueField(wireName: r'branch')
  PackageBranchScopeBranch? get branch;

  PackageBranchScope._();

  factory PackageBranchScope([void updates(PackageBranchScopeBuilder b)]) = _$PackageBranchScope;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackageBranchScopeBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackageBranchScope> get serializer => _$PackageBranchScopeSerializer();
}

class _$PackageBranchScopeSerializer implements PrimitiveSerializer<PackageBranchScope> {
  @override
  final Iterable<Type> types = const [PackageBranchScope, _$PackageBranchScope];

  @override
  final String wireName = r'PackageBranchScope';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackageBranchScope object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'active';
    yield serializers.serialize(
      object.active,
      specifiedType: const FullType(bool),
    );
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType(PackageBranchScopeBranch),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PackageBranchScope object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackageBranchScopeBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'active':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.active = valueDes;
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PackageBranchScopeBranch),
          ) as PackageBranchScopeBranch;
          result.branch.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PackageBranchScope deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackageBranchScopeBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

