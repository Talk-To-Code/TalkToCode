package ast;
/**
 * @author GAO RISHENG A0101891L
 * This class is mainly in charge of syntax of a new Object
 * constructor in Java program
 *
 */
public final class ASTExpressionUnitObjectConstructorJ extends ASTExpressionUnitObjectConstructor {

	public ASTExpressionUnitObjectConstructorJ(String type) {
		super(type);

	}
	//code syntax generation
	public String toSyntax(){
		this.result = "new "+this.type.toSyntax()+"(";
		for(int i = 0;i<this.parameters.size();i++){
			this.result+=this.parameters.get(i).toSyntax();
			if(i!=this.parameters.size()-1){
				this.result+=", ";
			}
		}
		this.result +=")";
		return this.result;
	}
}
