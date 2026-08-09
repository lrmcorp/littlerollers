//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'dec006_approval.g.dart';

/// Dec006Approval
///
/// Properties:
/// * [financeApproverId] 
/// * [productOwnerApproverId] 
/// * [approvedAt] 
@BuiltValue()
abstract class Dec006Approval implements Built<Dec006Approval, Dec006ApprovalBuilder> {
  @BuiltValueField(wireName: r'financeApproverId')
  String get financeApproverId;

  @BuiltValueField(wireName: r'productOwnerApproverId')
  String get productOwnerApproverId;

  @BuiltValueField(wireName: r'approvedAt')
  DateTime get approvedAt;

  Dec006Approval._();

  factory Dec006Approval([void updates(Dec006ApprovalBuilder b)]) = _$Dec006Approval;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(Dec006ApprovalBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Dec006Approval> get serializer => _$Dec006ApprovalSerializer();
}

class _$Dec006ApprovalSerializer implements PrimitiveSerializer<Dec006Approval> {
  @override
  final Iterable<Type> types = const [Dec006Approval, _$Dec006Approval];

  @override
  final String wireName = r'Dec006Approval';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Dec006Approval object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'financeApproverId';
    yield serializers.serialize(
      object.financeApproverId,
      specifiedType: const FullType(String),
    );
    yield r'productOwnerApproverId';
    yield serializers.serialize(
      object.productOwnerApproverId,
      specifiedType: const FullType(String),
    );
    yield r'approvedAt';
    yield serializers.serialize(
      object.approvedAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    Dec006Approval object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required Dec006ApprovalBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'financeApproverId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.financeApproverId = valueDes;
          break;
        case r'productOwnerApproverId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.productOwnerApproverId = valueDes;
          break;
        case r'approvedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.approvedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Dec006Approval deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = Dec006ApprovalBuilder();
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

