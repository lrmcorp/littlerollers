//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'check_in_result_branch.g.dart';

/// CheckInResultBranch
///
/// Properties:
/// * [code] 
/// * [name] 
@BuiltValue()
abstract class CheckInResultBranch implements Built<CheckInResultBranch, CheckInResultBranchBuilder> {
  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'name')
  String get name;

  CheckInResultBranch._();

  factory CheckInResultBranch([void updates(CheckInResultBranchBuilder b)]) = _$CheckInResultBranch;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CheckInResultBranchBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CheckInResultBranch> get serializer => _$CheckInResultBranchSerializer();
}

class _$CheckInResultBranchSerializer implements PrimitiveSerializer<CheckInResultBranch> {
  @override
  final Iterable<Type> types = const [CheckInResultBranch, _$CheckInResultBranch];

  @override
  final String wireName = r'CheckInResultBranch';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CheckInResultBranch object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CheckInResultBranch object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CheckInResultBranchBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CheckInResultBranch deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CheckInResultBranchBuilder();
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

