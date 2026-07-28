//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/customer_dashboard_overview_verification_documents_inner.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_dashboard_overview_verification.g.dart';

/// CustomerDashboardOverviewVerification
///
/// Properties:
/// * [status] 
/// * [documents] 
@BuiltValue()
abstract class CustomerDashboardOverviewVerification implements Built<CustomerDashboardOverviewVerification, CustomerDashboardOverviewVerificationBuilder> {
  @BuiltValueField(wireName: r'status')
  CustomerDashboardOverviewVerificationStatusEnum get status;
  // enum statusEnum {  PENDING,  ACTION_REQUIRED,  APPROVED,  };

  @BuiltValueField(wireName: r'documents')
  BuiltList<CustomerDashboardOverviewVerificationDocumentsInner> get documents;

  CustomerDashboardOverviewVerification._();

  factory CustomerDashboardOverviewVerification([void updates(CustomerDashboardOverviewVerificationBuilder b)]) = _$CustomerDashboardOverviewVerification;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerDashboardOverviewVerificationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerDashboardOverviewVerification> get serializer => _$CustomerDashboardOverviewVerificationSerializer();
}

class _$CustomerDashboardOverviewVerificationSerializer implements PrimitiveSerializer<CustomerDashboardOverviewVerification> {
  @override
  final Iterable<Type> types = const [CustomerDashboardOverviewVerification, _$CustomerDashboardOverviewVerification];

  @override
  final String wireName = r'CustomerDashboardOverviewVerification';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerDashboardOverviewVerification object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(CustomerDashboardOverviewVerificationStatusEnum),
    );
    yield r'documents';
    yield serializers.serialize(
      object.documents,
      specifiedType: const FullType(BuiltList, [FullType(CustomerDashboardOverviewVerificationDocumentsInner)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerDashboardOverviewVerification object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerDashboardOverviewVerificationBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerDashboardOverviewVerificationStatusEnum),
          ) as CustomerDashboardOverviewVerificationStatusEnum;
          result.status = valueDes;
          break;
        case r'documents':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CustomerDashboardOverviewVerificationDocumentsInner)]),
          ) as BuiltList<CustomerDashboardOverviewVerificationDocumentsInner>;
          result.documents.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerDashboardOverviewVerification deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerDashboardOverviewVerificationBuilder();
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

class CustomerDashboardOverviewVerificationStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const CustomerDashboardOverviewVerificationStatusEnum PENDING = _$customerDashboardOverviewVerificationStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'ACTION_REQUIRED')
  static const CustomerDashboardOverviewVerificationStatusEnum ACTION_REQUIRED = _$customerDashboardOverviewVerificationStatusEnum_ACTION_REQUIRED;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const CustomerDashboardOverviewVerificationStatusEnum APPROVED = _$customerDashboardOverviewVerificationStatusEnum_APPROVED;

  static Serializer<CustomerDashboardOverviewVerificationStatusEnum> get serializer => _$customerDashboardOverviewVerificationStatusEnumSerializer;

  const CustomerDashboardOverviewVerificationStatusEnum._(String name): super(name);

  static BuiltSet<CustomerDashboardOverviewVerificationStatusEnum> get values => _$customerDashboardOverviewVerificationStatusEnumValues;
  static CustomerDashboardOverviewVerificationStatusEnum valueOf(String name) => _$customerDashboardOverviewVerificationStatusEnumValueOf(name);
}

