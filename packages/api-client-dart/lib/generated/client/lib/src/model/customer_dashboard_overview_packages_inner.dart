//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_dashboard_overview_packages_inner.g.dart';

/// CustomerDashboardOverviewPackagesInner
///
/// Properties:
/// * [id] 
/// * [packageName] 
/// * [classTypeName] 
/// * [branchName] 
/// * [expiryAt] 
/// * [available] 
@BuiltValue()
abstract class CustomerDashboardOverviewPackagesInner implements Built<CustomerDashboardOverviewPackagesInner, CustomerDashboardOverviewPackagesInnerBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'packageName')
  String get packageName;

  @BuiltValueField(wireName: r'classTypeName')
  String get classTypeName;

  @BuiltValueField(wireName: r'branchName')
  String get branchName;

  @BuiltValueField(wireName: r'expiryAt')
  DateTime get expiryAt;

  @BuiltValueField(wireName: r'available')
  int get available;

  CustomerDashboardOverviewPackagesInner._();

  factory CustomerDashboardOverviewPackagesInner([void updates(CustomerDashboardOverviewPackagesInnerBuilder b)]) = _$CustomerDashboardOverviewPackagesInner;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerDashboardOverviewPackagesInnerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerDashboardOverviewPackagesInner> get serializer => _$CustomerDashboardOverviewPackagesInnerSerializer();
}

class _$CustomerDashboardOverviewPackagesInnerSerializer implements PrimitiveSerializer<CustomerDashboardOverviewPackagesInner> {
  @override
  final Iterable<Type> types = const [CustomerDashboardOverviewPackagesInner, _$CustomerDashboardOverviewPackagesInner];

  @override
  final String wireName = r'CustomerDashboardOverviewPackagesInner';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerDashboardOverviewPackagesInner object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'packageName';
    yield serializers.serialize(
      object.packageName,
      specifiedType: const FullType(String),
    );
    yield r'classTypeName';
    yield serializers.serialize(
      object.classTypeName,
      specifiedType: const FullType(String),
    );
    yield r'branchName';
    yield serializers.serialize(
      object.branchName,
      specifiedType: const FullType(String),
    );
    yield r'expiryAt';
    yield serializers.serialize(
      object.expiryAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'available';
    yield serializers.serialize(
      object.available,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerDashboardOverviewPackagesInner object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerDashboardOverviewPackagesInnerBuilder result,
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
        case r'packageName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.packageName = valueDes;
          break;
        case r'classTypeName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeName = valueDes;
          break;
        case r'branchName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchName = valueDes;
          break;
        case r'expiryAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expiryAt = valueDes;
          break;
        case r'available':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.available = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerDashboardOverviewPackagesInner deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerDashboardOverviewPackagesInnerBuilder();
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

