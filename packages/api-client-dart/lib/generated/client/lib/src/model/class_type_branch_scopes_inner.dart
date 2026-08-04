//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/branch.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'class_type_branch_scopes_inner.g.dart';

/// ClassTypeBranchScopesInner
///
/// Properties:
/// * [branchId] 
/// * [active] 
/// * [branch] 
@BuiltValue()
abstract class ClassTypeBranchScopesInner implements Built<ClassTypeBranchScopesInner, ClassTypeBranchScopesInnerBuilder> {
  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'active')
  bool get active;

  @BuiltValueField(wireName: r'branch')
  Branch? get branch;

  ClassTypeBranchScopesInner._();

  factory ClassTypeBranchScopesInner([void updates(ClassTypeBranchScopesInnerBuilder b)]) = _$ClassTypeBranchScopesInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ClassTypeBranchScopesInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ClassTypeBranchScopesInner> get serializer => _$ClassTypeBranchScopesInnerSerializer();
}

class _$ClassTypeBranchScopesInnerSerializer implements PrimitiveSerializer<ClassTypeBranchScopesInner> {
  @override
  final Iterable<Type> types = const [ClassTypeBranchScopesInner, _$ClassTypeBranchScopesInner];

  @override
  final String wireName = r'ClassTypeBranchScopesInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ClassTypeBranchScopesInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
        specifiedType: const FullType(Branch),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    ClassTypeBranchScopesInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ClassTypeBranchScopesInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
            specifiedType: const FullType(Branch),
          ) as Branch;
          result.branch = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ClassTypeBranchScopesInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ClassTypeBranchScopesInnerBuilder();
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

