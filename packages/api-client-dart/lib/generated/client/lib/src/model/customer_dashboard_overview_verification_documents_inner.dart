//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_dashboard_overview_verification_documents_inner.g.dart';

/// CustomerDashboardOverviewVerificationDocumentsInner
///
/// Properties:
/// * [kind] 
/// * [status] 
/// * [updatedAt] 
@BuiltValue()
abstract class CustomerDashboardOverviewVerificationDocumentsInner implements Built<CustomerDashboardOverviewVerificationDocumentsInner, CustomerDashboardOverviewVerificationDocumentsInnerBuilder> {
  @BuiltValueField(wireName: r'kind')
  CustomerDashboardOverviewVerificationDocumentsInnerKindEnum get kind;
  // enum kindEnum {  SELFIE,  KTP_FRONT,  };

  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  CustomerDashboardOverviewVerificationDocumentsInner._();

  factory CustomerDashboardOverviewVerificationDocumentsInner([void updates(CustomerDashboardOverviewVerificationDocumentsInnerBuilder b)]) = _$CustomerDashboardOverviewVerificationDocumentsInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerDashboardOverviewVerificationDocumentsInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerDashboardOverviewVerificationDocumentsInner> get serializer => _$CustomerDashboardOverviewVerificationDocumentsInnerSerializer();
}

class _$CustomerDashboardOverviewVerificationDocumentsInnerSerializer implements PrimitiveSerializer<CustomerDashboardOverviewVerificationDocumentsInner> {
  @override
  final Iterable<Type> types = const [CustomerDashboardOverviewVerificationDocumentsInner, _$CustomerDashboardOverviewVerificationDocumentsInner];

  @override
  final String wireName = r'CustomerDashboardOverviewVerificationDocumentsInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerDashboardOverviewVerificationDocumentsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'kind';
    yield serializers.serialize(
      object.kind,
      specifiedType: const FullType(CustomerDashboardOverviewVerificationDocumentsInnerKindEnum),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    yield r'updatedAt';
    yield serializers.serialize(
      object.updatedAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerDashboardOverviewVerificationDocumentsInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerDashboardOverviewVerificationDocumentsInnerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'kind':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerDashboardOverviewVerificationDocumentsInnerKindEnum),
          ) as CustomerDashboardOverviewVerificationDocumentsInnerKindEnum;
          result.kind = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.status = valueDes;
          break;
        case r'updatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.updatedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerDashboardOverviewVerificationDocumentsInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerDashboardOverviewVerificationDocumentsInnerBuilder();
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

class CustomerDashboardOverviewVerificationDocumentsInnerKindEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'SELFIE')
  static const CustomerDashboardOverviewVerificationDocumentsInnerKindEnum SELFIE = _$customerDashboardOverviewVerificationDocumentsInnerKindEnum_SELFIE;
  @BuiltValueEnumConst(wireName: r'KTP_FRONT')
  static const CustomerDashboardOverviewVerificationDocumentsInnerKindEnum KTP_FRONT = _$customerDashboardOverviewVerificationDocumentsInnerKindEnum_KTP_FRONT;

  static Serializer<CustomerDashboardOverviewVerificationDocumentsInnerKindEnum> get serializer => _$customerDashboardOverviewVerificationDocumentsInnerKindEnumSerializer;

  const CustomerDashboardOverviewVerificationDocumentsInnerKindEnum._(String name): super(name);

  static BuiltSet<CustomerDashboardOverviewVerificationDocumentsInnerKindEnum> get values => _$customerDashboardOverviewVerificationDocumentsInnerKindEnumValues;
  static CustomerDashboardOverviewVerificationDocumentsInnerKindEnum valueOf(String name) => _$customerDashboardOverviewVerificationDocumentsInnerKindEnumValueOf(name);
}

